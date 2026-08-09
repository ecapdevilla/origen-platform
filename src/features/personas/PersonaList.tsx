import { useMemo, useState } from 'react'
import { CheckCircle2, Plus, Search, XCircle } from 'lucide-react'
import type { MovimientoCaja } from '@/shared/types/comercial'
import type { EstadoPersona, Persona } from '@/shared/types/persona'

interface Props {
  personas: Persona[]
  movimientos: MovimientoCaja[]
  onNueva: () => void
  onVerDetalle: (persona: Persona) => void
  onEditar: (persona: Persona) => void
  onMarcarPago: (persona: Persona) => void
}

const estadoOptions: EstadoPersona[] = ['activa', 'en_pausa', 'registro', 'historica']

type FiltroPago = 'todos' | 'pagado' | 'sin_pagar'

export function PersonaList({
  personas,
  movimientos,
  onNueva,
  onVerDetalle,
  onEditar,
  onMarcarPago,
}: Props) {
  const [search, setSearch] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | EstadoPersona>('todos')
  const [filtroPago, setFiltroPago] = useState<FiltroPago>('todos')
  const [confirmarPago, setConfirmarPago] = useState<Persona | null>(null)

  // Mapa de personas que han pagado (tienen un ingreso asociado)
  const personasPagadas = useMemo(() => {
    const set = new Set<string>()

    movimientos
      .filter((movimiento) => movimiento.tipo === 'ingreso' && movimiento.personaId)
      .forEach((movimiento) => set.add(movimiento.personaId!))

    return set
  }, [movimientos])

  const personasFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase()

    return personas.filter((persona) => {
      const matchesEstado = estadoFiltro === 'todos' || persona.estado === estadoFiltro

      const haPagado = personasPagadas.has(persona.id)

      const matchesPago =
        filtroPago === 'todos' ||
        (filtroPago === 'pagado' && haPagado) ||
        (filtroPago === 'sin_pagar' && !haPagado)

      const texto = [
        persona.nombres,
        persona.apellidos,
        persona.documento,
        persona.telefono,
        persona.correo,
        persona.objetivo,
        persona.referidoPor ?? '',
      ]
        .join(' ')
        .toLowerCase()

      return matchesEstado && matchesPago && (!term || texto.includes(term))
    })
  }, [personas, search, estadoFiltro, filtroPago, personasPagadas])

  const personasActivas = personas.filter((persona) => persona.estado === 'activa').length
  const personasRegistro = personas.filter((persona) => persona.estado === 'registro').length
  const personasPausa = personas.filter((persona) => persona.estado === 'en_pausa').length
  const personasHistoricas = personas.filter((persona) => persona.estado === 'historica').length

  const sinPagar = personas.filter((persona) => !personasPagadas.has(persona.id)).length

  function confirmarPagoPersona() {
    if (confirmarPago) {
      onMarcarPago(confirmarPago)
      setConfirmarPago(null)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-800 bg-slate-950 p-6 text-white shadow-[0_20px_70px_-25px_rgba(15,23,42,0.35)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
              Personas
            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-4xl">Gestión de personas</h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              Administra los registros, objetivos, estados y pagos de cada persona del gimnasio.
            </p>
          </div>

          <button
            type="button"
            onClick={onNueva}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 transition hover:bg-slate-100"
          >
            <Plus size={18} />
            Nueva persona
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
        <Metric title="Total" value={String(personas.length)} />
        <Metric title="Activas" value={String(personasActivas)} />
        <Metric title="En registro" value={String(personasRegistro)} />
        <Metric title="En pausa" value={String(personasPausa)} />
        <Metric title="Sin pagar" value={String(sinPagar)} tone="rose" />
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black">Listado de personas</h2>
            <p className="mt-1 text-sm text-slate-500">
              Busca, selecciona o edita una persona. Marca los pagos recibidos.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar persona"
                className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-slate-950 sm:w-72"
              />
            </div>

            <select
              value={filtroPago}
              onChange={(event) => setFiltroPago(event.target.value as FiltroPago)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
            >
              <option value="todos">Todos los pagos</option>
              <option value="pagado">Pagados</option>
              <option value="sin_pagar">Sin pagar</option>
            </select>

            <select
              value={estadoFiltro}
              onChange={(event) =>
                setEstadoFiltro(event.target.value as 'todos' | EstadoPersona)
              }
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
            >
              <option value="todos">Todos los estados</option>
              {estadoOptions.map((estado) => (
                <option key={estado} value={estado}>
                  {estadoLabel(estado)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          {/* Tabla en desktop */}
          <div className="hidden overflow-hidden rounded-[1.5rem] border border-slate-200 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3">Persona</th>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Objetivo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Pago</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {personasFiltradas.map((persona) => {
                  const haPagado = personasPagadas.has(persona.id)

                  return (
                    <tr key={persona.id} className="border-t border-slate-100">
                      <td className="px-4 py-4">
                        <p className="font-black">
                          {persona.nombres} {persona.apellidos}
                        </p>
                        <p className="text-xs text-slate-500">{persona.correo}</p>
                      </td>

                      <td className="px-4 py-4">{persona.documento}</td>

                      <td className="px-4 py-4">{persona.objetivo}</td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${estadoBadgeClass(
                            persona.estado,
                          )}`}
                        >
                          {estadoLabel(persona.estado)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <PagoBadge haPagado={haPagado} />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onVerDetalle(persona)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black hover:bg-slate-50"
                          >
                            Ver
                          </button>

                          <button
                            type="button"
                            onClick={() => onEditar(persona)}
                            className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white hover:bg-slate-800"
                          >
                            Editar
                          </button>

                          {!haPagado && (
                            <button
                              type="button"
                              onClick={() => setConfirmarPago(persona)}
                              className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700"
                            >
                              Marcar pago
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {personasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                      No se encontraron personas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tarjetas en móvil */}
          <div className="space-y-3 md:hidden">
            {personasFiltradas.map((persona) => {
              const haPagado = personasPagadas.has(persona.id)

              return (
                <article
                  key={persona.id}
                  className="rounded-[1.5rem] border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-black text-slate-900">
                        {persona.nombres} {persona.apellidos}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {persona.correo || 'Sin correo'}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${estadoBadgeClass(
                        persona.estado,
                      )}`}
                    >
                      {estadoLabel(persona.estado)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Documento
                      </p>
                      <p className="truncate text-sm font-black text-slate-700">
                        {persona.documento}
                      </p>
                    </div>

                    <PagoBadge haPagado={haPagado} />
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onVerDetalle(persona)}
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50"
                    >
                      Ver perfil
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditar(persona)}
                      className="flex-1 rounded-xl bg-slate-950 px-3 py-2.5 text-xs font-black text-white hover:bg-slate-800"
                    >
                      Editar
                    </button>

                    {!haPagado && (
                      <button
                        type="button"
                        onClick={() => setConfirmarPago(persona)}
                        className="flex-1 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-black text-white hover:bg-emerald-700"
                      >
                        Marcar pago
                      </button>
                    )}
                  </div>
                </article>
              )
            })}

            {personasFiltradas.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                No se encontraron personas.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Metric title="Históricas" value={String(personasHistoricas)} />
        <Metric title="En pausa" value={String(personasPausa)} />
        <Metric title="Registro" value={String(personasRegistro)} />
        <Metric title="Activas" value={String(personasActivas)} />
      </section>

      {/* Diálogo de confirmación de pago */}
      {confirmarPago && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black">Confirmar pago</h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              ¿Estás seguro de que{' '}
              <strong>
                {confirmarPago.nombres} {confirmarPago.apellidos}
              </strong>{' '}
              ya realizó su pago? Se registrará un ingreso en caja asociado a esta persona.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setConfirmarPago(null)}
                className="flex-1 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarPagoPersona}
                className="flex-1 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
              >
                Sí, confirmar pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PagoBadge({ haPagado }: { haPagado: boolean }) {
  if (haPagado) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
        <CheckCircle2 size={14} />
        Pagado
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700">
      <XCircle size={14} />
      Sin pagar
    </span>
  )
}

function Metric({
  title,
  value,
  tone = 'slate',
}: {
  title: string
  value: string
  tone?: 'slate' | 'rose'
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <p
        className={`mt-2 text-2xl font-black ${
          tone === 'rose' ? 'text-rose-600' : 'text-slate-950'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function estadoLabel(estado: EstadoPersona) {
  const labels: Record<EstadoPersona, string> = {
    activa: 'Activa',
    en_pausa: 'En pausa',
    registro: 'En registro',
    historica: 'Histórica',
  }

  return labels[estado]
}

function estadoBadgeClass(estado: EstadoPersona) {
  const classes: Record<EstadoPersona, string> = {
    activa: 'bg-emerald-50 text-emerald-700',
    en_pausa: 'bg-amber-50 text-amber-700',
    registro: 'bg-blue-50 text-blue-700',
    historica: 'bg-slate-100 text-slate-700',
  }

  return classes[estado]
}
