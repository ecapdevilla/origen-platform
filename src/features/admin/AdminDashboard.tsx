import type { MovimientoCaja } from '@/shared/types/comercial'
import type { Constancia } from '@/shared/types/constancia'
import type { Persona } from '@/shared/types/persona'
import type { Producto } from '@/shared/types/tienda'

interface Props {
  personas: Persona[]
  constancias: Constancia[]
  movimientos: MovimientoCaja[]
  productos: Producto[]
  onGoPersonas: () => void
}

export function AdminDashboard({
  personas,
  constancias,
  movimientos,
  productos,
  onGoPersonas,
}: Props) {
  const hoy = new Date().toISOString().slice(0, 10)

  const personasActivas = personas.filter((persona) => persona.estado === 'activa')
  const personasRegistro = personas.filter((persona) => persona.estado === 'registro')
  const personasPausa = personas.filter((persona) => persona.estado === 'en_pausa')

  const constanciasHoy = constancias.filter(
    (constancia) => constancia.fecha.slice(0, 10) === hoy,
  )

  const porcentajeAsistencia =
    personasActivas.length > 0
      ? Math.round((constanciasHoy.length / personasActivas.length) * 100)
      : 0

  const ingresos = movimientos
    .filter((movimiento) => movimiento.tipo === 'ingreso')
    .reduce((total, movimiento) => total + movimiento.valor, 0)

  const gastos = movimientos
    .filter((movimiento) => movimiento.tipo === 'gasto')
    .reduce((total, movimiento) => total + movimiento.valor, 0)

  const cajaNeta = ingresos - gastos

  const productosBajoStock = productos.filter(
    (producto) => producto.activo && producto.stock > 0 && producto.stock <= 3,
  )

  const productosAgotados = productos.filter(
    (producto) => producto.activo && producto.stock <= 0,
  )

  const movimientosRecientes = [...movimientos]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 6)

  const personasRecientes = [...personas]
    .sort(
      (a, b) =>
        new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime(),
    )
    .slice(0, 6)

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-surface-800 bg-surface-950 p-5 text-white shadow-[0_20px_70px_-25px_rgba(28,25,23,0.35)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-surface-300 sm:text-sm">Panel principal</p>

            <h1 className="mt-2 text-2xl font-black sm:text-4xl">Bienvenido a ORIGEN</h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-surface-300 sm:mt-4 sm:text-base sm:leading-7">
              Cada persona importa. Cada hábito cuenta. Cada logro merece ser celebrado.
            </p>
          </div>

          <button
            type="button"
            onClick={onGoPersonas}
            className="w-full rounded-2xl bg-brand-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-brand-700 sm:w-auto lg:px-6 lg:py-4"
          >
            Registrar persona
          </button>
        </div>
      </section>


      <section className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4 md:gap-4">
        <Metric title="Personas" value={String(personas.length)} />
        <Metric title="Activas" value={String(personasActivas.length)} />
        <Metric title="Constancias hoy" value={String(constanciasHoy.length)} />
        <Metric title="Asistencia hoy" value={`${porcentajeAsistencia}%`} />
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4 md:gap-4">
        <Metric title="Ingresos" value={formatMoney(ingresos)} />
        <Metric title="Gastos" value={formatMoney(gastos)} />
        <Metric title="Caja neta" value={formatMoney(cajaNeta)} />
        <Metric title="Bajo stock" value={String(productosBajoStock.length)} />
      </section>


      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="space-y-6">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-black text-surface-900">
                  Estado de personas
                </h2>

                <p className="mt-1 text-sm text-surface-500">
                  Resumen de personas por estado dentro del gimnasio.
                </p>
              </div>

              <button
                type="button"
                onClick={onGoPersonas}
                className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-black text-white hover:bg-brand-700"
              >
                Ir a personas
              </button>

            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <StatusCard
                title="Activas"
                value={personasActivas.length}
                description="Personas entrenando actualmente"
              />

              <StatusCard
                title="En registro"
                value={personasRegistro.length}
                description="Personas nuevas o pendientes"
              />

              <StatusCard
                title="En pausa"
                value={personasPausa.length}
                description="Personas pausadas temporalmente"
              />
            </div>
          </section>

          <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black text-surface-900">
              Movimientos recientes
            </h2>

            <p className="mt-1 text-sm text-surface-500">
              Últimos ingresos y gastos registrados en caja.
            </p>

            <div className="mt-6 space-y-3">
              {movimientosRecientes.map((movimiento) => (
                <div
                  key={movimiento.id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-surface-50 p-4"
                >
                  <div>
                    <p className="font-black text-surface-900">
                      {movimiento.concepto}
                    </p>

                    <p className="mt-1 text-sm text-surface-500">
                      {formatDate(movimiento.fecha)} ·{' '}
                      {movimiento.metodoPago || 'Sin método'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-black ${
                        movimiento.tipo === 'ingreso'
                          ? 'text-success-700'
                          : 'text-danger-700'
                      }`}
                    >
                      {movimiento.tipo === 'ingreso' ? '+' : '-'}
                      {formatMoney(movimiento.valor)}
                    </p>

                    <p className="mt-1 text-xs font-bold text-surface-400">
                      {movimiento.tipo}
                    </p>
                  </div>
                </div>
              ))}

              {movimientosRecientes.length === 0 && (
                <Empty message="Todavía no hay movimientos de caja." />
              )}
            </div>
          </section>

        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black text-surface-900">
              Personas recientes
            </h2>

            <p className="mt-1 text-sm text-surface-500">
              Últimos registros creados en ORIGEN.
            </p>

            <div className="mt-5 space-y-3">
              {personasRecientes.map((persona) => (
                <div key={persona.id} className="rounded-2xl bg-surface-50 p-4">
                  <p className="font-black text-surface-900">
                    {persona.nombres} {persona.apellidos}
                  </p>

                  <p className="mt-1 text-sm text-surface-500">{persona.objetivo}</p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-surface-700">
                      {persona.estado}
                    </span>

                    <span className="text-xs font-bold text-surface-400">
                      {formatDate(persona.fechaRegistro)}
                    </span>
                  </div>
                </div>
              ))}

              {personasRecientes.length === 0 && (
                <Empty message="Todavía no hay personas registradas." />
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black text-surface-900">
              Alertas de inventario
            </h2>

            <p className="mt-1 text-sm text-surface-500">
              Productos bajos o agotados en tienda.
            </p>

            <div className="mt-5 space-y-3">
              {productosAgotados.map((producto) => (
                <div key={producto.id} className="rounded-2xl bg-danger-50 p-4">
                  <p className="font-black text-danger-700">{producto.nombre}</p>
                  <p className="mt-1 text-sm text-danger-600">Producto agotado</p>
                </div>
              ))}

              {productosBajoStock.map((producto) => (
                <div key={producto.id} className="rounded-2xl bg-warning-50 p-4">
                  <p className="font-black text-warning-700">{producto.nombre}</p>
                  <p className="mt-1 text-sm text-warning-600">
                    Stock bajo: {producto.stock}
                  </p>
                </div>
              ))}

              {productosAgotados.length === 0 && productosBajoStock.length === 0 && (
                <Empty message="No hay alertas de inventario." />
              )}
            </div>
          </section>

        </aside>
      </section>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-surface-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-surface-500">{title}</p>
      <p className="mt-3 text-2xl font-black text-surface-900">{value}</p>
    </div>
  )
}

function StatusCard({
  title,
  value,
  description,
}: {
  title: string
  value: number
  description: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-surface-200 bg-surface-50 p-5">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-surface-500">{title}</p>
      <p className="mt-2 text-3xl font-black text-surface-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-surface-500">{description}</p>
    </div>
  )
}

function Empty({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-surface-300 p-6 text-center text-sm text-surface-500">
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