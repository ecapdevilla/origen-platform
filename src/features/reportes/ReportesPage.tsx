import { useMemo } from 'react'
import type { MovimientoCaja } from '@/shared/types/comercial'
import type { Constancia } from '@/shared/types/constancia'
import type { Persona } from '@/shared/types/persona'
import type { Producto } from '@/shared/types/tienda'

interface Props {
  personas: Persona[]
  constancias: Constancia[]
  movimientos: MovimientoCaja[]
  productos: Producto[]
}

export function ReportesPage({ personas, constancias, movimientos, productos }: Props) {
  const hoy = new Date().toISOString().slice(0, 10)

  const personasActivas = personas.filter((persona) => persona.estado === 'activa').length
  const personasRegistro = personas.filter((persona) => persona.estado === 'registro').length
  const personasPausa = personas.filter((persona) => persona.estado === 'en_pausa').length
  const personasHistoricas = personas.filter((persona) => persona.estado === 'historica').length

  const constanciasHoy = constancias.filter(
    (constancia) => constancia.fecha.slice(0, 10) === hoy,
  ).length

  const porcentajeAsistencia =
    personasActivas > 0 ? Math.round((constanciasHoy / personasActivas) * 100) : 0

  const ingresos = movimientos
    .filter((movimiento) => movimiento.tipo === 'ingreso')
    .reduce((total, movimiento) => total + movimiento.valor, 0)

  const gastos = movimientos
    .filter((movimiento) => movimiento.tipo === 'gasto')
    .reduce((total, movimiento) => total + movimiento.valor, 0)

  const cajaNeta = ingresos - gastos

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

  const movimientosRecientes = useMemo(() => {
    return [...movimientos]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 8)
  }, [movimientos])

  const rankingConstancia = useMemo(() => {
    return personas
      .map((persona) => {
        const total = constancias.filter(
          (constancia) => constancia.personaId === persona.id,
        ).length

        return {
          persona,
          total,
        }
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [personas, constancias])

  const resumenEstados = [
    {
      label: 'Activas',
      value: personasActivas,
      total: personas.length,
    },
    {
      label: 'En registro',
      value: personasRegistro,
      total: personas.length,
    },
    {
      label: 'En pausa',
      value: personasPausa,
      total: personas.length,
    },
    {
      label: 'Históricas',
      value: personasHistoricas,
      total: personas.length,
    },
  ]

  const resumenFinanciero = [
    {
      label: 'Ingresos',
      value: ingresos,
    },
    {
      label: 'Gastos',
      value: gastos,
    },
    {
      label: 'Caja neta',
      value: cajaNeta,
    },
  ]

  const resumenInventario = [
    {
      label: 'Productos',
      value: productos.length,
    },
    {
      label: 'Stock total',
      value: stockTotal,
    },
    {
      label: 'Bajo stock',
      value: productosBajoStock,
    },
  ]
    return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-800 bg-slate-950 p-6 text-white shadow-[0_20px_70px_-25px_rgba(15,23,42,0.35)] sm:p-8">
        <p className="text-sm text-slate-300">Reportes</p>

        <h1 className="mt-3 text-4xl font-black">Indicadores de ORIGEN</h1>

        <p className="mt-4 max-w-3xl text-slate-300">
          Visualiza el estado general del gimnasio: personas, constancia, caja, tienda e inventario.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric title="Personas" value={String(personas.length)} />
        <Metric title="Activas" value={String(personasActivas)} />
        <Metric title="Constancia hoy" value={String(constanciasHoy)} />
        <Metric title="Asistencia hoy" value={`${porcentajeAsistencia}%`} />
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric title="Ingresos" value={formatMoney(ingresos)} />
        <Metric title="Gastos" value={formatMoney(gastos)} />
        <Metric title="Caja neta" value={formatMoney(cajaNeta)} />
        <Metric title="Productos bajo stock" value={String(productosBajoStock)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black">Estado de personas</h2>

            <p className="mt-1 text-sm text-slate-500">
              Distribución actual de personas según su estado.
            </p>

            <div className="mt-6 space-y-4">
              {resumenEstados.map((item) => (
                <Progress
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  total={item.total}
                />
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black">Ranking de constancia</h2>

            <p className="mt-1 text-sm text-slate-500">
              Personas con mayor número de constancias registradas.
            </p>

            <div className="mt-6 space-y-3">
              {rankingConstancia.map((item, index) => (
                <div
                  key={item.persona.id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-black">
                        {item.persona.nombres} {item.persona.apellidos}
                      </p>
                      <p className="text-xs text-slate-500">{item.persona.objetivo}</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700">
                    {item.total} constancias
                  </span>
                </div>
              ))}

              {rankingConstancia.length === 0 && (
                <Empty message="Todavía no hay información de constancia." />
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black">Movimientos recientes</h2>

            <p className="mt-1 text-sm text-slate-500">
              Últimos ingresos y gastos registrados en caja.
            </p>

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
                    {movimientosRecientes.map((movimiento) => (
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

                    {movimientosRecientes.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                          Todavía no hay movimientos registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Tarjetas en móvil */}
              <div className="space-y-3 md:hidden">
                {movimientosRecientes.map((movimiento) => (
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

                {movimientosRecientes.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                    Todavía no hay movimientos registrados.
                  </div>
                )}
              </div>
            </div>

          </section>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black">Resumen financiero</h2>

            <div className="mt-5 space-y-3">
              {resumenFinanciero.map((item) => (
                <Line key={item.label} label={item.label} value={formatMoney(item.value)} />
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black">Inventario</h2>

            <div className="mt-5 space-y-3">
              {resumenInventario.map((item) => (
                <Line key={item.label} label={item.label} value={String(item.value)} />
              ))}

              <Line label="Valor venta" value={formatMoney(valorInventarioVenta)} />
              <Line label="Valor costo" value={formatMoney(valorInventarioCosto)} />
              <Line
                label="Margen estimado"
                value={formatMoney(valorInventarioVenta - valorInventarioCosto)}
              />
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black">Constancia</h2>

            <div className="mt-5 space-y-3">
              <Line label="Personas activas" value={String(personasActivas)} />
              <Line label="Constancias hoy" value={String(constanciasHoy)} />
              <Line label="Asistencia hoy" value={`${porcentajeAsistencia}%`} />
              <Line label="Total constancias" value={String(constancias.length)} />
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black">Lectura rápida</h2>

            <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              <p>
                Hoy hay <strong>{constanciasHoy}</strong> constancias registradas sobre{' '}
                <strong>{personasActivas}</strong> personas activas.
              </p>

              <p className="mt-3">
                La caja neta actual es <strong>{formatMoney(cajaNeta)}</strong> y el inventario
                tiene un valor estimado de venta de{' '}
                <strong>{formatMoney(valorInventarioVenta)}</strong>.
              </p>
            </div>
          </section>
        </aside>
      </section>
    </div>
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

function Progress({
  label,
  value,
  total,
}: {
  label: string
  value: number
  total: number
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm font-black text-slate-700">{label}</span>
        <span className="text-sm font-black text-slate-500">
          {value} / {total}
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-950" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <span className="text-right text-sm font-black">{value}</span>
    </div>
  )
}

function Empty({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
      {message}
    </div>
  )
}

function formatDate(date: string) {
  return new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString('es-CO', {
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