import asyncio
from typing import List
from fastapi import FastAPI, HTTPException, status
from models import VentaRequest, VentaResponse, ProductoResponse, HealthResponse

app = FastAPI()

INVENTARIO = {
    1: {"nombre": "Procesador AMD Ryzen 5 5600X", "stock": 999999},
    2: {"nombre": "Memoria RAM DDR4 16GB", "stock": 999999},
    3: {"nombre": "SSD NVMe 1TB", "stock": 999999},
    4: {"nombre": "Fuente de poder 750W 80+ Gold", "stock": 999999},
    5: {"nombre": "Tarjeta gráfica RTX 4060", "stock": 999999},
}

@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok")

@app.post("/api/v1/ventas", response_model=VentaResponse)
async def crear_venta(request: VentaRequest):
    await asyncio.sleep(0.05)
    if request.producto_id not in INVENTARIO:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    producto = INVENTARIO[request.producto_id]
    if producto["stock"] < request.cantidad:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stock insuficiente"
        )
    producto["stock"] -= request.cantidad
    return VentaResponse(
        mensaje="Venta registrada exitosamente",
        producto_id=request.producto_id,
        cantidad_vendida=request.cantidad,
        stock_restante=producto["stock"]
    )

@app.get("/api/v1/productos", response_model=List[ProductoResponse])
async def listar_productos():
    return [
        ProductoResponse(id=p_id, nombre=p["nombre"], stock=p["stock"])
        for p_id, p in INVENTARIO.items()
    ]

@app.get("/api/v1/productos/{producto_id}", response_model=ProductoResponse)
async def obtener_producto(producto_id: int):
    if producto_id not in INVENTARIO:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    producto = INVENTARIO[producto_id]
    return ProductoResponse(
        id=producto_id,
        nombre=producto["nombre"],
        stock=producto["stock"]
    )
