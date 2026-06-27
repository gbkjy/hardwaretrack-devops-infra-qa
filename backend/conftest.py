import pytest
from fastapi.testclient import TestClient
from main import app, INVENTARIO

@pytest.fixture(scope="function")
def client():
    return TestClient(app)

@pytest.fixture(autouse=True)
def reset_stock():
    original_stock = {
        1: 999999,
        2: 999999,
        3: 999999,
        4: 999999,
        5: 999999,
    }
    for key, stock_val in original_stock.items():
        INVENTARIO[key]["stock"] = stock_val
