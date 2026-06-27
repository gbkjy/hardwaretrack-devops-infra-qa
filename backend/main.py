from typing import List
from fastapi import FastAPI, HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import engine, Base, ProductoDb, VentaDb, get_db
from models import VentaRequest, VentaResponse, ProductoResponse, HealthResponse, ProductoCreateRequest, VentaItemResponse, StockUpdateRequest

app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.on_event("startup")
def startup_populate():
    db = next(get_db())
    try:
        count = db.query(ProductoDb).count()
        if count == 0:
            productos = [
                ProductoDb(id=1, nombre="Procesador AMD Ryzen 5 5600X", precio=250000.0, stock=999999),
                ProductoDb(id=2, nombre="Memoria RAM DDR4 16GB", precio=45000.0, stock=999999),
                ProductoDb(id=3, nombre="SSD NVMe 1TB", precio=75000.0, stock=999999),
                ProductoDb(id=4, nombre="Fuente de poder 750W 80+ Gold", precio=95000.0, stock=999999),
                ProductoDb(id=5, nombre="Tarjeta gráfica RTX 4060", precio=350000.0, stock=999999),
            ]
            db.bulk_save_objects(productos)
            db.commit()
    finally:
        db.close()

@app.get("/health", response_model=HealthResponse)
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return HealthResponse(status="ok")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database unavailable"
        )

@app.post("/api/v1/ventas", response_model=VentaResponse)
def crear_venta(request: VentaRequest, db: Session = Depends(get_db)):
    producto = db.query(ProductoDb).filter(ProductoDb.id == request.producto_id).with_for_update().first()
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    if producto.stock < request.cantidad:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stock insuficiente"
        )
    producto.stock -= request.cantidad
    nueva_venta = VentaDb(producto_id=request.producto_id, cantidad=request.cantidad)
    db.add(nueva_venta)
    db.commit()
    db.refresh(producto)
    return VentaResponse(
        mensaje="Venta registrada exitosamente",
        producto_id=request.producto_id,
        cantidad_vendida=request.cantidad,
        stock_restante=producto.stock
    )

@app.get("/api/v1/productos", response_model=List[ProductoResponse])
def listar_productos(db: Session = Depends(get_db)):
    productos = db.query(ProductoDb).all()
    return [
        ProductoResponse(id=p.id, nombre=p.nombre, precio=p.precio, stock=p.stock)
        for p in productos
    ]

@app.get("/api/v1/productos/{producto_id}", response_model=ProductoResponse)
def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = db.query(ProductoDb).filter(ProductoDb.id == producto_id).first()
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    return ProductoResponse(
        id=producto.id,
        nombre=producto.nombre,
        precio=producto.precio,
        stock=producto.stock
    )

@app.post("/api/v1/productos", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
def crear_producto(request: ProductoCreateRequest, db: Session = Depends(get_db)):
    nuevo_producto = ProductoDb(
        nombre=request.nombre,
        precio=request.precio,
        stock=request.stock
    )
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    return ProductoResponse(
        id=nuevo_producto.id,
        nombre=nuevo_producto.nombre,
        precio=nuevo_producto.precio,
        stock=nuevo_producto.stock
    )

@app.get("/api/v1/ventas", response_model=List[VentaItemResponse])
def listar_ventas(db: Session = Depends(get_db)):
    results = db.query(VentaDb, ProductoDb.nombre).join(
        ProductoDb, VentaDb.producto_id == ProductoDb.id
    ).order_by(VentaDb.fecha.desc()).all()
    
    return [
        VentaItemResponse(
            id=venta.id,
            producto_id=venta.producto_id,
            nombre_producto=nombre,
            cantidad=venta.cantidad,
            fecha=venta.fecha.isoformat() + "Z"
        )
        for venta, nombre in results
    ]

@app.patch("/api/v1/productos/{producto_id}/stock", response_model=ProductoResponse)
def actualizar_stock(producto_id: int, request: StockUpdateRequest, db: Session = Depends(get_db)):
    producto = db.query(ProductoDb).filter(ProductoDb.id == producto_id).with_for_update().first()
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    if request.operacion == "merma":
        if producto.stock < request.cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stock insuficiente para merma"
            )
        producto.stock -= request.cantidad
    elif request.operacion == "ingreso":
        producto.stock += request.cantidad
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Operación no válida"
        )
        
    db.commit()
    db.refresh(producto)
    return ProductoResponse(
        id=producto.id,
        nombre=producto.nombre,
        precio=producto.precio,
        stock=producto.stock
    )
