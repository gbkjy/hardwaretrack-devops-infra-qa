import pytest
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal, ProductoDb, VentaDb

@pytest.fixture(scope="function")
def client():
    return TestClient(app)

@pytest.fixture(autouse=True)
def reset_stock():
    db = SessionLocal()
    try:
        db.query(VentaDb).delete()
        db.query(ProductoDb).delete()
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
