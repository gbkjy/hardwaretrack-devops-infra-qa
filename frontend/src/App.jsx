import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [usuarioRol, setUsuarioRol] = useState('cajero')
  const [activeTab, setActiveTab] = useState('pos')

  const [searchTerm, setSearchTerm] = useState('')

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

  const [stockProductoId, setStockProductoId] = useState('')
  const [stockCantidad, setStockCantidad] = useState(1)
  const [stockOperacion, setStockOperacion] = useState('ingreso')
  const [stockStatus, setStockStatus] = useState(null)
  const [stockError, setStockError] = useState(null)

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
        setStockProductoId(data[0].id)
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

  const handleStockUpdateSubmit = async (e) => {
    e.preventDefault()
    setStockStatus(null)
    setStockError(null)

    try {
      const res = await fetch(`/api/v1/productos/${stockProductoId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cantidad: parseInt(stockCantidad),
          operacion: stockOperacion
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Error al actualizar stock')
      }

      const msg = stockOperacion === 'ingreso' ? 'Ingreso registrado' : 'Merma registrada'
      setStockStatus(`${msg}. Nuevo stock: ${data.stock}`)
      setStockCantidad(1)
      fetchProductos()
    } catch (err) {
      setStockError(err.message)
    }
  }

  const filteredProductos = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const calcularIngresosTotales = () => {
    return ventasRealizadas.reduce((acc, v) => {
      const prod = productos.find(p => p.id === v.producto_id)
      const precio = prod ? prod.precio : 0
      return acc + (v.cantidad * precio)
    }, 0)
  }

  return (
    <div className="app-container">
      <header>
        <div className="header-top">
          <div className="title-area">
            <h1>HardwareTrack POS</h1>
            <p>Gestión de inventario y ventas</p>
          </div>
          <div className="role-selector">
            <label htmlFor="role-select">Rol activo:</label>
            <select 
              id="role-select" 
              value={usuarioRol} 
              onChange={(e) => {
                const rol = e.target.value
                setUsuarioRol(rol)
                if (rol === 'cajero') setActiveTab('pos')
                if (rol === 'bodeguero') setActiveTab('bodega')
                if (rol === 'gerente') setActiveTab('gerencial')
              }}
            >
              <option value="cajero">Cajero</option>
              <option value="bodeguero">Bodeguero</option>
              <option value="gerente">Gerente</option>
            </select>
          </div>
        </div>
        
        <nav className="tab-navigation">
          {(usuarioRol === 'cajero' || usuarioRol === 'gerente') && (
            <button 
              className={`tab-btn ${activeTab === 'pos' ? 'active' : ''}`}
              onClick={() => setActiveTab('pos')}
            >
              Punto de venta
            </button>
          )}
          {(usuarioRol === 'bodeguero' || usuarioRol === 'gerente') && (
            <button 
              className={`tab-btn ${activeTab === 'bodega' ? 'active' : ''}`}
              onClick={() => setActiveTab('bodega')}
            >
              Bodega
            </button>
          )}
          {usuarioRol === 'gerente' && (
            <button 
              className={`tab-btn ${activeTab === 'gerencial' ? 'active' : ''}`}
              onClick={() => setActiveTab('gerencial')}
            >
              Panel gerencial
            </button>
          )}
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'pos' && (usuarioRol === 'cajero' || usuarioRol === 'gerente') && (
          <div className="pos-layout">
            <section className="inventory-section">
              <h2>Inventario actual</h2>
              
              <div className="search-box">
                <label htmlFor="search-input">Buscar producto:</label>
                <input
                  type="text"
                  id="search-input"
                  placeholder="Escribe el nombre del producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

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
                    {filteredProductos.map(p => (
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
            </section>
          </div>
        )}

        {activeTab === 'bodega' && (usuarioRol === 'bodeguero' || usuarioRol === 'gerente') && (
          <div className="bodega-layout">
            <section className="inventory-section">
              <h2>Inventario actual (vista bodega)</h2>
              {loading && <p id="loading-text">Cargando existencias...</p>}
              {error && <p className="error-text" id="error-text">{error}</p>}
              
              {!loading && !error && (
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Producto</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map(p => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.nombre}</td>
                        <td className={p.stock < 10 ? 'low-stock' : ''}>{p.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="actions-section">
              <div className="action-box">
                <h2>Actualizar existencias</h2>
                <form onSubmit={handleStockUpdateSubmit} id="stock-update-form">
                  <div className="form-group">
                    <label htmlFor="stock-product-select">Producto:</label>
                    <select
                      id="stock-product-select"
                      value={stockProductoId}
                      onChange={(e) => setStockProductoId(e.target.value)}
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
                    <label htmlFor="stock-op-select">Tipo de movimiento:</label>
                    <select
                      id="stock-op-select"
                      value={stockOperacion}
                      onChange={(e) => setStockOperacion(e.target.value)}
                      required
                    >
                      <option value="ingreso">Ingreso de mercadería</option>
                      <option value="merma">Registro de merma</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="stock-qty-input">Cantidad:</label>
                    <input
                      type="number"
                      id="stock-qty-input"
                      min="1"
                      value={stockCantidad}
                      onChange={(e) => setStockCantidad(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" id="submit-stock-btn" className="btn-submit">
                    Guardar movimiento
                  </button>
                </form>

                {stockStatus && (
                  <div className="status-success" id="stock-success">
                    {stockStatus}
                  </div>
                )}

                {stockError && (
                  <div className="status-error" id="stock-error">
                    {stockError}
                  </div>
                )}
              </div>

              {usuarioRol === 'gerente' && (
                <div className="action-box" style={{ marginTop: '20px' }}>
                  <h2>Agregar producto nuevo</h2>
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
              )}
            </section>
          </div>
        )}

        {activeTab === 'gerencial' && usuarioRol === 'gerente' && (
          <div className="gerencial-layout">
            <section className="inventory-section">
              <h2>Historial de ventas</h2>
              {ventasRealizadas.length > 0 ? (
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
              ) : (
                <p>No se registran ventas en el sistema.</p>
              )}
            </section>

            <section className="actions-section">
              <div className="action-box">
                <h2>Métricas de recaudación</h2>
                <div className="finance-card" style={{ width: '100%', display: 'block' }}>
                  <h3>Ingresos totales</h3>
                  <p className="finance-amount">
                    ${calcularIngresosTotales().toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
