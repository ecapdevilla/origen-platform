import { useMemo, useState, type FormEvent } from 'react'
import { Plus, Search } from 'lucide-react'
import type { MovimientoCaja, Servicio } from '@/shared/types/comercial'
import type { Persona } from '@/shared/types/persona'

interface Props {
  personas: Persona[]
  servicios: Servicio[]
  movimientos: MovimientoCaja[]
  onCreateServicio: (servicio: Servicio) => void
  onCreateMovimiento: (movimiento: MovimientoCaja) => void
}

type TipoServicio = Servicio['tipo']
type TipoMovimiento = MovimientoCaja['tipo']
type FiltroMovimiento = 'todos' | TipoMovimiento

const tiposServicio: Array<{ value: TipoServicio; label: string }> = [
  { value: 'membresia', label: 'Membresía' },
  { value: 'personalizado', label: 'Personalizado' },
  { value: 'producto_servicio', label: 'Producto / Servicio' },
  { value: 'otro', label: 'Otro' },
]

const metodosPago = ['Efectivo', 'Transferencia', 'Tarjeta', 'Nequi', 'Daviplata', 'Otro']

const initialServicioForm = {
  nombre: '',
  tipo: 'membresia' as TipoServicio,
  precio: '',
  duracionDias: '30',
}

const initialMovimientoForm = {
  tipo: 'ingreso' as TipoMovimiento,
  concepto: '',
  valor: '',
  personaId: '',
  servicioId: '',
  metodoPago: 'Efectivo',
  observacion: '',
}

export function ComercialPage({
  personas,
  servicios,
  movimientos,
  onCreateServicio,
  onCreateMovimiento,
}: Props) {
  const [servicioForm, setServicioForm] = useState(initialServicioForm)
  const [movimientoForm, setMovimientoForm] = useState(initialMovimientoForm)
  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState<FiltroMovimiento>('todos')

  const personasActivas = useMemo(() => {
    return personas.filter((persona) => persona.estado === 'activa')
  }, [personas])

  const ingresos = useMemo(() => {
    return movimientos
      .filter((movimiento) => movimiento.tipo === 'ingreso')
      .reduce((total, movimiento) => total + movimiento.valor, 0)
  }, [movimientos])

  const gastos = useMemo(() => {
    return movimientos
      .filter((movimiento) => movimiento.tipo === 'gasto')
      .reduce((total, movimiento) => total + movimiento.valor, 0)
  }, [movimientos])

  const cajaNeta = ingresos - gastos

  const movimientosFiltrados = useMemo(() => {
    const term = search.toLowerCase().trim()

    return [...movimientos]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .filter((movimiento) => {
        const persona = personas.find((item) => item.id === movimiento.personaId)
        const servicio = servicios.find((item) => item.id === movimiento.servicioId)

        const cumpleFiltro = filtro === 'todos' || movimiento.tipo === filtro

        const textoBusqueda = [
          movimiento.concepto,
          movimiento.metodoPago ?? '',
          movimiento.observacion ?? '',
          persona?.nombres ?? '',
          persona?.apellidos ?? '',
          persona?.documento ?? '',
          servicio?.nombre ?? '',
        ]
          .join(' ')
          .toLowerCase()

        const cumpleBusqueda = !term || textoBusqueda.includes(term)

        return cumpleFiltro && cumpleBusqueda
      })
  }, [movimientos, personas, servicios, search, filtro])

  function crearServicio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const precio = Number(servicioForm.precio)
    const duracionDias = Number(servicioForm.duracionDias)

    if (!servicioForm.nombre.trim()) {
      alert('Ingresa el nombre del servicio.')
      return
    }

    if (!Number.isFinite(precio) || precio <= 0) {
      alert('El precio debe ser mayor a cero.')
      return
    }

    if (!Number.isFinite(duracionDias) || duracionDias <= 0) {
      alert('La duración debe ser mayor a cero.')
      return
    }

    onCreateServicio({
      id: crypto.randomUUID(),
      nombre: servicioForm.nombre.trim(),
      tipo: servicioForm.tipo,
      precio,
      duracionDias,
      activo: true,
      fechaCreacion: new Date().toISOString(),
    })

    setServicioForm(initialServicioForm)
  }

  function crearMovimiento(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const valor = Number(movimientoForm.valor)

    if (!movimientoForm.concepto.trim()) {
      alert('Ingresa el concepto.')
      return
    }

    if (!Number.isFinite(valor) || valor <= 0) {
      alert('El valor debe ser mayor a cero.')
      return
    }

    onCreateMovimiento({
      id: crypto.randomUUID(),
      tipo: movimientoForm.tipo,
      concepto: movimientoForm.concepto.trim(),
      valor,
      fecha: new Date().toISOString(),
      personaId:
        movimientoForm.tipo === 'ingreso' && movimientoForm.personaId
          ? movimientoForm.personaId
          : undefined,
      servicioId:
        movimientoForm.tipo === 'ingreso' && movimientoForm.servicioId
          ? movimientoForm.servicioId
          : undefined,
      metodoPago: movimientoForm.metodoPago,
      observacion: movimientoForm.observacion.trim() || undefined,
    })

    setMovimientoForm(initialMovimientoForm)
  }

  function seleccionarServicio(servicioId: string) {
    const servicio = servicios.find((item) => item.id === servicioId)

    setMovimientoForm((current) => ({
      ...current,
      servicioId,
      concepto: servicio ? `Pago ${servicio.nombre}` : current.concepto,
      valor: servicio ? String(servicio.precio) : current.valor,
    }))
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-800 bg-slate-950 p-6 text-white shadow-[0_20px_70px_-25px_rgba(15,23,42,0.35)] sm:p-8">
        <p className="text-sm text-slate-300">Módulo Comercial</p>
        <h1 className="mt-3 text-4xl font-black">Caja y servicios</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Registra servicios, ingresos, pagos y gastos del gimnasio.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric title="Ingresos" value={formatMoney(ingresos)} />
        <Metric title="Gastos" value={formatMoney(gastos)} />
        <Metric title="Caja neta" value={formatMoney(cajaNeta)} />
        <Metric title="Movimientos" value={String(movimientos.length)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black">Crear servicio</h2>

            <form onSubmit={crearServicio} className="mt-6 grid gap-4">
              <Input
                label="Nombre"
                value={servicioForm.nombre}
                onChange={(value) => setServicioForm({ ...servicioForm, nombre: value })}
              />

              <label className="block">
                <span className="text-sm font-bold text-slate-700">Tipo</span>
                <select
                  value={servicioForm.tipo}
                  onChange={(event) =>
                    setServicioForm({
                      ...servicioForm,
                      tipo: event.target.value as TipoServicio,
                    })
                  }
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                >
                  {tiposServicio.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </label>

              <Input
                label="Precio"
                type="number"
                value={servicioForm.precio}
                onChange={(value) => setServicioForm({ ...servicioForm, precio: value })}
              />

              <Input
                label="Duración en días"
                type="number"
                value={servicioForm.duracionDias}
                onChange={(value) =>
                  setServicioForm({ ...servicioForm, duracionDias: value })
                }
              />

              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-black text-white hover:bg-slate-800">
                <Plus size={18} />
                Crear servicio
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black">Registrar movimiento</h2>

            <form onSubmit={crearMovimiento} className="mt-6 grid gap-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Tipo</span>
                <select
                  value={movimientoForm.tipo}
                  onChange={(event) =>
                    setMovimientoForm({
                      ...movimientoForm,
                      tipo: event.target.value as TipoMovimiento,
                      personaId: '',
                      servicioId: '',
                    })
                  }
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                >
                  <option value="ingreso">Ingreso</option>
                  <option value="gasto">Gasto</option>
                </select>
              </label>

              {movimientoForm.tipo === 'ingreso' && (
                <>
                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">Persona</span>
                    <select
                      value={movimientoForm.personaId}
                      onChange={(event) =>
                        setMovimientoForm({
                          ...movimientoForm,
                          personaId: event.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                    >
                      <option value="">Sin persona asociada</option>
                      {personasActivas.map((persona) => (
                        <option key={persona.id} value={persona.id}>
                          {persona.nombres} {persona.apellidos}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">Servicio</span>
                    <select
                      value={movimientoForm.servicioId}
                      onChange={(event) => seleccionarServicio(event.target.value)}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                    >
                      <option value="">Sin servicio asociado</option>
                      {servicios
                        .filter((servicio) => servicio.activo)
                        .map((servicio) => (
                          <option key={servicio.id} value={servicio.id}>
                            {servicio.nombre} - {formatMoney(servicio.precio)}
                          </option>
                        ))}
                    </select>
                  </label>
                </>
              )}

              <Input
                label="Concepto"
                value={movimientoForm.concepto}
                onChange={(value) =>
                  setMovimientoForm({ ...movimientoForm, concepto: value })
                }
              />

              <Input
                label="Valor"
                type="number"
                value={movimientoForm.valor}
                onChange={(value) => setMovimientoForm({ ...movimientoForm, valor: value })}
              />

              <label className="block">
                <span className="text-sm font-bold text-slate-700">Método de pago</span>
                <select
                  value={movimientoForm.metodoPago}
                  onChange={(event) =>
                    setMovimientoForm({
                      ...movimientoForm,
                      metodoPago: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                >
                  {metodosPago.map((metodo) => (
                    <option key={metodo}>{metodo}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">Observación</span>
                <textarea
                  value={movimientoForm.observacion}
                  onChange={(event) =>
                    setMovimientoForm({
                      ...movimientoForm,
                      observacion: event.target.value,
                    })
                  }
                  className="mt-1 min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                />
              </label>

              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-black text-white hover:bg-slate-800">
                <Plus size={18} />
                Guardar movimiento
              </button>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Servicios</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {servicios.map((servicio) => (
                <article key={servicio.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-black">{servicio.nombre}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {getTipoServicioLabel(servicio.tipo)} · {servicio.duracionDias} días
                  </p>
                  <p className="mt-3 text-xl font-black">{formatMoney(servicio.precio)}</p>
                </article>
              ))}

              {servicios.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 md:col-span-2">
                  No hay servicios creados.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-black">Historial</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Movimientos de caja registrados.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar"
                    className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none"
                  />
                </div>

                <select
                  value={filtro}
                  onChange={(event) => setFiltro(event.target.value as FiltroMovimiento)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                >
                  <option value="todos">Todos</option>
                  <option value="ingreso">Ingresos</option>
                  <option value="gasto">Gastos</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              {/* Tabla en desktop */}
              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Concepto</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3 text-right">Valor</th>
                    </tr>
                  </thead>

                  <tbody>
                    {movimientosFiltrados.map((movimiento) => (
                      <tr key={movimiento.id} className="border-t border-slate-100">
                        <td className="px-4 py-4">{formatDate(movimiento.fecha)}</td>
                        <td className="px-4 py-4">
                          <p className="font-black">{movimiento.concepto}</p>
                          <p className="text-xs text-slate-500">
                            {movimiento.metodoPago || 'Sin método'}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              movimiento.tipo === 'ingreso'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {movimiento.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-black">
                          {formatMoney(movimiento.valor)}
                        </td>
                      </tr>
                    ))}

                    {movimientosFiltrados.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                          No hay movimientos para mostrar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Tarjetas en móvil */}
              <div className="space-y-3 md:hidden">
                {movimientosFiltrados.map((movimiento) => (
                  <article
                    key={movimiento.id}
                    className="rounded-[1.5rem] border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-black text-slate-900">{movimiento.concepto}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatDate(movimiento.fecha)}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                          movimiento.tipo === 'ingreso'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {movimiento.tipo}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold text-slate-400">
                        {movimiento.metodoPago || 'Sin método'}
                      </p>

                      <p
                        className={`font-black ${
                          movimiento.tipo === 'ingreso'
                            ? 'text-emerald-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {movimiento.tipo === 'ingreso' ? '+' : '-'}
                        {formatMoney(movimiento.valor)}
                      </p>
                    </div>
                  </article>
                ))}

                {movimientosFiltrados.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                    No hay movimientos para mostrar.
                  </div>
                )}
              </div>
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

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  )
}

function getTipoServicioLabel(tipo: TipoServicio) {
  const found = tiposServicio.find((item) => item.value === tipo)
  return found?.label ?? tipo
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