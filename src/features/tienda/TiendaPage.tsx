import { useMemo, useState, type FormEvent } from 'react'
import { Plus, Search } from 'lucide-react'
import type { MovimientoCaja } from '@/shared/types/comercial'
import type { MovimientoInventario, Producto } from '@/shared/types/tienda'

interface Props {
  productos: Producto[]
  movimientosInventario: MovimientoInventario[]
  onCreateProducto: (producto: Producto) => void
  onUpdateProducto: (producto: Producto) => void
  onCreateMovimientoInventario: (movimiento: MovimientoInventario) => void
  onCreateMovimientoCaja: (movimiento: MovimientoCaja) => void
}

const metodosPago = ['Efectivo', 'Transferencia', 'Tarjeta', 'Nequi', 'Daviplata', 'Otro']

const initialProductoForm = {
  nombre: '',
  categoria: '',
  precioVenta: '',
  costo: '',
  stock: '',
}

const initialVentaForm = {
  productoId: '',
  cantidad: '1',
  metodoPago: 'Efectivo',
}

const initialEntradaForm = {
  productoId: '',
  cantidad: '1',
  observacion: '',
}

export function TiendaPage({
  productos,
  movimientosInventario,
  onCreateProducto,
  onUpdateProducto,
  onCreateMovimientoInventario,
  onCreateMovimientoCaja,
}: Props) {
  const [productoForm, setProductoForm] = useState(initialProductoForm)
  const [ventaForm, setVentaForm] = useState(initialVentaForm)
  const [entradaForm, setEntradaForm] = useState(initialEntradaForm)
  const [search, setSearch] = useState('')

  const productosActivos = useMemo(() => {
    return productos.filter((producto) => producto.activo)
  }, [productos])

  const productosFiltrados = useMemo(() => {
    const term = search.toLowerCase().trim()

    return productos.filter((producto) => {
      const texto = `${producto.nombre} ${producto.categoria}`.toLowerCase()
      return !term || texto.includes(term)
    })
  }, [productos, search])

  const stockTotal = productos.reduce((total, producto) => total + producto.stock, 0)

  const valorInventarioVenta = productos.reduce(
    (total, producto) => total + producto.stock * producto.precioVenta,
    0,
  )

  const valorInventarioCosto = productos.reduce(
    (total, producto) => total + producto.stock * producto.costo,
    0,
  )

  const productosBajoStock = productos.filter((producto) => producto.stock <= 3).length

  const movimientosOrdenados = useMemo(() => {
    return [...movimientosInventario].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    )
  }, [movimientosInventario])

  function crearProducto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const precioVenta = Number(productoForm.precioVenta)
    const costo = Number(productoForm.costo)
    const stock = Number(productoForm.stock)

    if (!productoForm.nombre.trim()) {
      alert('Ingresa el nombre del producto.')
      return
    }

    if (!productoForm.categoria.trim()) {
      alert('Ingresa la categoría del producto.')
      return
    }

    if (!Number.isFinite(precioVenta) || precioVenta <= 0) {
      alert('El precio de venta debe ser mayor a cero.')
      return
    }

    if (!Number.isFinite(costo) || costo < 0) {
      alert('El costo no puede ser negativo.')
      return
    }

    if (!Number.isFinite(stock) || stock < 0) {
      alert('El stock no puede ser negativo.')
      return
    }

    onCreateProducto({
      id: crypto.randomUUID(),
      nombre: productoForm.nombre.trim(),
      categoria: productoForm.categoria.trim(),
      precioVenta,
      costo,
      stock,
      activo: true,
      fechaCreacion: new Date().toISOString(),
    })

    setProductoForm(initialProductoForm)
  }

  function registrarVenta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const producto = productos.find((item) => item.id === ventaForm.productoId)
    const cantidad = Number(ventaForm.cantidad)

    if (!producto) {
      alert('Selecciona un producto.')
      return
    }

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      alert('La cantidad debe ser mayor a cero.')
      return
    }

    if (cantidad > producto.stock) {
      alert('No hay stock suficiente para esta venta.')
      return
    }

    const totalVenta = producto.precioVenta * cantidad

    onUpdateProducto({
      ...producto,
      stock: producto.stock - cantidad,
    })

    onCreateMovimientoInventario({
      id: crypto.randomUUID(),
      productoId: producto.id,
      tipo: 'venta',
      cantidad,
      fecha: new Date().toISOString(),
      observacion: `Venta de ${cantidad} unidad(es)`,
    })

    onCreateMovimientoCaja({
      id: crypto.randomUUID(),
      tipo: 'ingreso',
      concepto: `Venta tienda: ${producto.nombre}`,
      valor: totalVenta,
      fecha: new Date().toISOString(),
      metodoPago: ventaForm.metodoPago,
      observacion: `Venta automática desde tienda. Cantidad: ${cantidad}`,
    })

    setVentaForm(initialVentaForm)
  }

  function registrarEntrada(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const producto = productos.find((item) => item.id === entradaForm.productoId)
    const cantidad = Number(entradaForm.cantidad)

    if (!producto) {
      alert('Selecciona un producto.')
      return
    }

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      alert('La cantidad debe ser mayor a cero.')
      return
    }

    onUpdateProducto({
      ...producto,
      stock: producto.stock + cantidad,
    })

    onCreateMovimientoInventario({
      id: crypto.randomUUID(),
      productoId: producto.id,
      tipo: 'entrada',
      cantidad,
      fecha: new Date().toISOString(),
      observacion: entradaForm.observacion.trim() || 'Entrada de inventario',
    })

    setEntradaForm(initialEntradaForm)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-slate-950 p-8 text-white">
        <p className="text-sm text-slate-300">Módulo Tienda</p>
        <h1 className="mt-3 text-4xl font-black">Inventario y ventas</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Registra productos, controla stock, entradas de inventario y ventas de tienda.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric title="Productos" value={String(productos.length)} />
        <Metric title="Stock total" value={String(stockTotal)} />
        <Metric title="Valor venta" value={formatMoney(valorInventarioVenta)} />
        <Metric title="Bajo stock" value={String(productosBajoStock)} />
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric title="Costo inventario" value={formatMoney(valorInventarioCosto)} />
        <Metric
          title="Margen potencial"
          value={formatMoney(valorInventarioVenta - valorInventarioCosto)}
        />
        <Metric
          title="Ventas"
          value={String(
            movimientosInventario.filter((movimiento) => movimiento.tipo === 'venta').length,
          )}
        />
        <Metric
          title="Entradas"
          value={String(
            movimientosInventario.filter((movimiento) => movimiento.tipo === 'entrada').length,
          )}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Crear producto</h2>

            <form onSubmit={crearProducto} className="mt-6 grid gap-4">
              <Input
                label="Nombre"
                value={productoForm.nombre}
                onChange={(value) => setProductoForm({ ...productoForm, nombre: value })}
              />

              <Input
                label="Categoría"
                value={productoForm.categoria}
                onChange={(value) => setProductoForm({ ...productoForm, categoria: value })}
              />

              <Input
                label="Precio venta"
                type="number"
                value={productoForm.precioVenta}
                onChange={(value) =>
                  setProductoForm({ ...productoForm, precioVenta: value })
                }
              />

              <Input
                label="Costo"
                type="number"
                value={productoForm.costo}
                onChange={(value) => setProductoForm({ ...productoForm, costo: value })}
              />

              <Input
                label="Stock inicial"
                type="number"
                value={productoForm.stock}
                onChange={(value) => setProductoForm({ ...productoForm, stock: value })}
              />

              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-black text-white hover:bg-slate-800">
                <Plus size={18} />
                Crear producto
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Registrar venta</h2>

            <form onSubmit={registrarVenta} className="mt-6 grid gap-4">
              <SelectProducto
                label="Producto"
                value={ventaForm.productoId}
                productos={productosActivos}
                onChange={(value) => setVentaForm({ ...ventaForm, productoId: value })}
              />

              <Input
                label="Cantidad"
                type="number"
                value={ventaForm.cantidad}
                onChange={(value) => setVentaForm({ ...ventaForm, cantidad: value })}
              />

              <label className="block">
                <span className="text-sm font-bold text-slate-700">Método de pago</span>
                <select
                  value={ventaForm.metodoPago}
                  onChange={(event) =>
                    setVentaForm({ ...ventaForm, metodoPago: event.target.value })
                  }
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                >
                  {metodosPago.map((metodo) => (
                    <option key={metodo}>{metodo}</option>
                  ))}
                </select>
              </label>

              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-black text-white hover:bg-slate-800">
                <Plus size={18} />
                Registrar venta
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Entrada de inventario</h2>

            <form onSubmit={registrarEntrada} className="mt-6 grid gap-4">
              <SelectProducto
                label="Producto"
                value={entradaForm.productoId}
                productos={productosActivos}
                onChange={(value) =>
                  setEntradaForm({ ...entradaForm, productoId: value })
                }
              />

              <Input
                label="Cantidad"
                type="number"
                value={entradaForm.cantidad}
                onChange={(value) => setEntradaForm({ ...entradaForm, cantidad: value })}
              />

              <label className="block">
                <span className="text-sm font-bold text-slate-700">Observación</span>
                <textarea
                  value={entradaForm.observacion}
                  onChange={(event) =>
                    setEntradaForm({ ...entradaForm, observacion: event.target.value })
                  }
                  className="mt-1 min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                />
              </label>

              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-black text-white hover:bg-slate-800">
                <Plus size={18} />
                Registrar entrada
              </button>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-black">Productos</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Inventario disponible.
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar producto"
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none"
                />
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {productosFiltrados.map((producto) => (
                <article key={producto.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{producto.nombre}</p>
                      <p className="mt-1 text-sm text-slate-500">{producto.categoria}</p>
                    </div>

                    <StockBadge stock={producto.stock} />
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <Mini label="Venta" value={formatMoney(producto.precioVenta)} />
                    <Mini label="Costo" value={formatMoney(producto.costo)} />
                    <Mini label="Stock" value={String(producto.stock)} />
                  </div>
                </article>
              ))}

              {productosFiltrados.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 md:col-span-2">
                  No hay productos para mostrar.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Movimientos de inventario</h2>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3 text-right">Cantidad</th>
                  </tr>
                </thead>

                <tbody>
                  {movimientosOrdenados.map((movimiento) => {
                    const producto = productos.find((item) => item.id === movimiento.productoId)

                    return (
                      <tr key={movimiento.id} className="border-t border-slate-100">
                        <td className="px-4 py-4">{formatDate(movimiento.fecha)}</td>

                        <td className="px-4 py-4">
                          <p className="font-black">
                            {producto ? producto.nombre : 'Producto no encontrado'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {movimiento.observacion || '-'}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              movimiento.tipo === 'entrada'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {movimiento.tipo}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right font-black">
                          {movimiento.cantidad}
                        </td>
                      </tr>
                    )
                  })}

                  {movimientosOrdenados.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                        No hay movimientos de inventario.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
      />
    </label>
  )
}

function SelectProducto({
  label,
  value,
  productos,
  onChange,
}: {
  label: string
  value: string
  productos: Producto[]
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
      >
        <option value="">Seleccionar producto</option>
        {productos.map((producto) => (
          <option key={producto.id} value={producto.id}>
            {producto.nombre} - Stock {producto.stock} - {formatMoney(producto.precioVenta)}
          </option>
        ))}
      </select>
    </label>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  )
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700">
        Sin stock
      </span>
    )
  }

  if (stock <= 3) {
    return (
      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
        Bajo stock
      </span>
    )
  }

  return (
    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
      Disponible
    </span>
  )
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}