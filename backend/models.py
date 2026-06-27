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
    stock: int

class HealthResponse(BaseModel):
    status: str
