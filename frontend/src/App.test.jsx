import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

describe('Aplicación POS HardwareTrack', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renderiza el título y carga los productos exitosamente', async () => {
    const mockProducts = [
      { id: 1, nombre: 'Procesador AMD Ryzen 5', precio: 150000, stock: 100 },
      { id: 2, nombre: 'Memoria RAM 16GB', precio: 45000, stock: 5 }
    ]

    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.includes('/api/v1/productos')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProducts)
        })
      }
      if (url.includes('/api/v1/ventas')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      }
      return Promise.reject(new Error('URL Desconocida'))
    })

    render(<App />)

    expect(screen.getByText('HardwareTrack POS')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Procesador AMD Ryzen 5')).toBeInTheDocument()
      expect(screen.getByText('Memoria RAM 16GB')).toBeInTheDocument()
    })
  })

  it('procesa el registro de una venta exitosamente', async () => {
    const mockProducts = [
      { id: 1, nombre: 'Procesador AMD Ryzen 5', precio: 150000, stock: 100 }
    ]

    vi.spyOn(global, 'fetch').mockImplementation((url, options) => {
      if (url.includes('/api/v1/productos')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProducts)
        })
      }
      if (url.includes('/api/v1/ventas')) {
        if (options && options.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ stock_restante: 98 })
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      }
      return Promise.reject(new Error('URL Desconocida'))
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Procesador AMD Ryzen 5')).toBeInTheDocument()
    })

    const submitBtn = screen.getByRole('button', { name: 'Vender' })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Venta exitosa. Stock restante: 98')).toBeInTheDocument()
    })
  })

  it('procesa el registro de un nuevo producto exitosamente', async () => {
    const mockProducts = []

    vi.spyOn(global, 'fetch').mockImplementation((url, options) => {
      if (url.includes('/api/v1/productos')) {
        if (options && options.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id: 9, nombre: 'Teclado Mecanico', precio: 60000, stock: 10 })
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProducts)
        })
      }
      if (url.includes('/api/v1/ventas')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      }
      return Promise.reject(new Error('URL Desconocida'))
    })

    render(<App />)

    const roleSelect = screen.getByLabelText('Rol activo:')
    fireEvent.change(roleSelect, { target: { value: 'gerente' } })

    const bodegaTab = screen.getByRole('button', { name: 'Bodega' })
    fireEvent.click(bodegaTab)

    const nameInput = screen.getByLabelText('Nombre:')
    const priceInput = screen.getByLabelText('Precio:')
    const stockInput = screen.getByLabelText('Stock inicial:')
    const submitBtn = screen.getByRole('button', { name: 'Guardar' })

    fireEvent.change(nameInput, { target: { value: 'Teclado Mecanico' } })
    fireEvent.change(priceInput, { target: { value: '60000' } })
    fireEvent.change(stockInput, { target: { value: '10' } })

    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Producto agregado (ID: 9)')).toBeInTheDocument()
    })
  })

  it('procesa el ingreso o actualizacion de stock exitosamente', async () => {
    const mockProducts = [
      { id: 1, nombre: 'Procesador AMD Ryzen 5', precio: 150000, stock: 100 }
    ]

    vi.spyOn(global, 'fetch').mockImplementation((url, options) => {
      if (url.includes('/api/v1/productos/1/stock') && options && options.method === 'PATCH') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 1, nombre: 'Procesador AMD Ryzen 5', precio: 150000, stock: 105 })
        })
      }
      if (url.includes('/api/v1/productos')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProducts)
        })
      }
      if (url.includes('/api/v1/ventas')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      }
      return Promise.reject(new Error('URL Desconocida'))
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Procesador AMD Ryzen 5')).toBeInTheDocument()
    })

    const roleSelect = screen.getByLabelText('Rol activo:')
    fireEvent.change(roleSelect, { target: { value: 'gerente' } })

    const bodegaTab = screen.getByRole('button', { name: 'Bodega' })
    fireEvent.click(bodegaTab)

    const qtyInput = screen.getByLabelText('Cantidad:')
    const submitBtn = screen.getByRole('button', { name: 'Guardar movimiento' })

    fireEvent.change(qtyInput, { target: { value: '5' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Ingreso registrado. Nuevo stock: 105')).toBeInTheDocument()
    })
  })

  it('filtra los productos segun el termino de busqueda ingresado', async () => {
    const mockProducts = [
      { id: 1, nombre: 'Procesador AMD Ryzen 5', precio: 150000, stock: 100 },
      { id: 2, nombre: 'Memoria RAM 16GB', precio: 45000, stock: 5 }
    ]

    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.includes('/api/v1/productos')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProducts)
        })
      }
      if (url.includes('/api/v1/ventas')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      }
      return Promise.reject(new Error('URL Desconocida'))
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Procesador AMD Ryzen 5')).toBeInTheDocument()
      expect(screen.getByText('Memoria RAM 16GB')).toBeInTheDocument()
    })

    const searchInput = screen.getByLabelText('Buscar producto:')
    fireEvent.change(searchInput, { target: { value: 'RAM' } })

    expect(screen.queryByText('Procesador AMD Ryzen 5')).not.toBeInTheDocument()
    expect(screen.getByText('Memoria RAM 16GB')).toBeInTheDocument()
  })
})
