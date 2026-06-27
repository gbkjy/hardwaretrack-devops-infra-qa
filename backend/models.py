from pydantic import BaseModel, Field

class VentaRequest(BaseModel):
    producto_id: int
    cantidad: int = Field(..., ge=1)

class VentaResponse(BaseModel):
    mensaje: str
    producto_id: int
    cantidad_vendida: int
    stock_restante: int

class ProductoResponse(BaseModel):
    id: int
    nombre: str
    precio: float
    stock: int

class ProductoCreateRequest(BaseModel):
    nombre: str = Field(..., min_length=1)
    precio: float = Field(..., ge=0)
    stock: int = Field(..., ge=0)

class VentaItemResponse(BaseModel):
    id: int
    producto_id: int
    nombre_producto: str
    cantidad: int
    fecha: str

class HealthResponse(BaseModel):
    status: str
