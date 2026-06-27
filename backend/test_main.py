def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_venta_exitosa(client):
    response = client.post("/api/v1/ventas", json={"producto_id": 1, "cantidad": 2})
    assert response.status_code == 200
    assert response.json()["stock_restante"] == 999997

def test_venta_stock_insuficiente(client):
    client.post("/api/v1/ventas", json={"producto_id": 1, "cantidad": 999999})
    response = client.post("/api/v1/ventas", json={"producto_id": 1, "cantidad": 1})
    assert response.status_code == 400
    assert response.json()["detail"] == "Stock insuficiente"

def test_venta_producto_no_encontrado(client):
    response = client.post("/api/v1/ventas", json={"producto_id": 999, "cantidad": 1})
    assert response.status_code == 404
    assert response.json()["detail"] == "Producto no encontrado"

def test_venta_cantidad_invalida(client):
    response = client.post("/api/v1/ventas", json={"producto_id": 1, "cantidad": 0})
    assert response.status_code == 422

def test_listar_productos(client):
    response = client.get("/api/v1/productos")
    assert response.status_code == 200
    assert len(response.json()) == 5

def test_obtener_producto_exitoso(client):
    response = client.get("/api/v1/productos/1")
    assert response.status_code == 200
    assert response.json()["id"] == 1
    assert response.json()["nombre"] == "Procesador AMD Ryzen 5 5600X"

def test_obtener_producto_no_encontrado(client):
    response = client.get("/api/v1/productos/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Producto no encontrado"

def test_crear_producto_exitoso(client):
    response = client.post("/api/v1/productos", json={"nombre": "Mouse Gamer", "precio": 35000.0, "stock": 50})
    assert response.status_code == 201
    assert response.json()["nombre"] == "Mouse Gamer"
    assert response.json()["precio"] == 35000.0
    assert response.json()["stock"] == 50

def test_crear_producto_invalido(client):
    response = client.post("/api/v1/productos", json={"nombre": "", "precio": -10, "stock": 50})
    assert response.status_code == 422

def test_listar_ventas(client):
    # Register a sale first
    client.post("/api/v1/ventas", json={"producto_id": 1, "cantidad": 2})
    response = client.get("/api/v1/ventas")
    assert response.status_code == 200
    assert len(response.json()) > 0
    assert response.json()[0]["producto_id"] == 1
    assert response.json()[0]["cantidad"] == 2
    assert "nombre_producto" in response.json()[0]
