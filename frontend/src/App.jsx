import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [ventaStatus, setVentaStatus] = useState(null)
  const [ventaError, setVentaError] = useState(null)
  const [ventasRealizadas, setVentasRealizadas] = useState([])

  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoPrecio, setNuevoPrecio] = useState('')
  const [nuevoStock, setNuevoStock] = useState('')
  const [productoStatus, setProductoStatus] = useState(null)
  const [productoError, setProductoError] = useState(null)

  useEffect(() => {
    fetchProductos()
    fetchVentas()
  }, [])

  const fetchProductos = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/v1/productos')
      if (!res.ok) throw new Error('Error al cargar productos')
      const data = await res.json()
      setProductos(data)
      if (data.length > 0) {
        setProductoSeleccionado(data[0].id)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchVentas = async () => {
    try {
      const res = await fetch('/api/v1/ventas')
      if (!res.ok) throw new Error('Error al cargar ventas')
      const data = await res.json()
      setVentasRealizadas(data)
    } catch (err) {
      console.error(err.message)
    }
  }

  const handleVentaSubmit = async (e) => {
    e.preventDefault()
    setVentaStatus(null)
    setVentaError(null)

    try {
      const res = await fetch('/api/v1/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producto_id: parseInt(productoSeleccionado),
          cantidad: parseInt(cantidad)
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Error al registrar venta')
      }

      setVentaStatus(`Venta exitosa. Stock restante: ${data.stock_restante}`)
      fetchProductos()
      fetchVentas()
    } catch (err) {
      setVentaError(err.message)
    }
  }

  const handleProductoSubmit = async (e) => {
    e.preventDefault()
    setProductoStatus(null)
    setProductoError(null)

    try {
      const res = await fetch('/api/v1/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoNombre,
          precio: parseFloat(nuevoPrecio),
          stock: parseInt(nuevoStock)
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Error al registrar producto')
      }

      setProductoStatus(`Producto agregado (ID: ${data.id})`)
      setNuevoNombre('')
      setNuevoPrecio('')
      setNuevoStock('')
      fetchProductos()
    } catch (err) {
      setProductoError(err.message)
    }
  }

  return (
    <div className="app-container">
      <header>
        <h1>HardwareTrack POS</h1>
        <p>Gestión de inventario y ventas</p>
      </header>

      <main className="main-content">
        <section className="inventory-section">
          <h2>Inventario actual</h2>
          {loading && <p id="loading-text">Cargando existencias...</p>}
          {error && <p className="error-text" id="error-text">{error}</p>}

          {!loading && !error && (
            <table className="products-table" id="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nombre}</td>
                    <td>{p.precio ? `$${p.precio.toLocaleString('es-CL')}` : 'N/A'}</td>
                    <td className={p.stock < 10 ? 'low-stock' : ''}>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="actions-section">
          <div className="action-box">
            <h2>Nueva venta</h2>
            <form onSubmit={handleVentaSubmit} id="sales-form">
              <div className="form-group">
                <label htmlFor="producto-select">Producto:</label>
                <select
                  id="producto-select"
                  value={productoSeleccionado}
                  onChange={(e) => setProductoSeleccionado(e.target.value)}
                  required
                >
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="cantidad-input">Cantidad:</label>
                <input
                  type="number"
                  id="cantidad-input"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  required
                />
              </div>

              <button type="submit" id="submit-sale-btn" className="btn-submit">
                Vender
              </button>
            </form>

            {ventaStatus && (
              <div className="status-success" id="venta-success">
                {ventaStatus}
              </div>
            )}

            {ventaError && (
              <div className="status-error" id="venta-error">
                {ventaError}
              </div>
            )}
          </div>

          <div className="action-box" style={{ marginTop: '20px' }}>
            <h2>Agregar producto</h2>
            <form onSubmit={handleProductoSubmit} id="product-form">
              <div className="form-group">
                <label htmlFor="product-name-input">Nombre:</label>
                <input
                  type="text"
                  id="product-name-input"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="product-price-input">Precio:</label>
                <input
                  type="number"
                  id="product-price-input"
                  min="0"
                  step="any"
                  value={nuevoPrecio}
                  onChange={(e) => setNuevoPrecio(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="product-stock-input">Stock inicial:</label>
                <input
                  type="number"
                  id="product-stock-input"
                  min="0"
                  value={nuevoStock}
                  onChange={(e) => setNuevoStock(e.target.value)}
                  required
                />
              </div>

              <button type="submit" id="submit-product-btn" className="btn-submit">
                Guardar
              </button>
            </form>

            {productoStatus && (
              <div className="status-success" id="product-success">
                {productoStatus}
              </div>
            )}

            {productoError && (
              <div className="status-error" id="product-error">
                {productoError}
              </div>
            )}
          </div>
        </section>
      </main>

      {ventasRealizadas.length > 0 && (
        <section className="history-section" style={{ marginTop: '30px' }}>
          <h2>Historial de ventas</h2>
          <table className="products-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {ventasRealizadas.map(v => (
                <tr key={v.id}>
                  <td>{new Date(v.fecha).toLocaleString('es-CL')}</td>
                  <td>{v.nombre_producto}</td>
                  <td>{v.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}

export default App
