import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import type { EstadoPersona, Persona } from '@/shared/types/persona'

interface Props {
  personas: Persona[]
  onNueva: () => void
  onVerDetalle: (persona: Persona) => void
  onEditar: (persona: Persona) => void
}

const estadoOptions: EstadoPersona[] = ['activa', 'en_pausa', 'registro', 'historica']

export function PersonaList({ personas, onNueva, onVerDetalle, onEditar }: Props) {
  const [search, setSearch] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | EstadoPersona>('todos')

  const personasFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase()

    return personas.filter((persona) => {
      const matchesEstado = estadoFiltro === 'todos' || persona.estado === estadoFiltro

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

      return matchesEstado && (!term || texto.includes(term))
    })
  }, [personas, search, estadoFiltro])

  const personasActivas = personas.filter((persona) => persona.estado === 'activa').length
  const personasRegistro = personas.filter((persona) => persona.estado === 'registro').length
  const personasPausa = personas.filter((persona) => persona.estado === 'en_pausa').length
  const personasHistoricas = personas.filter((persona) => persona.estado === 'historica').length

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
              Administra los registros, objetivos y estados de cada persona del gimnasio.
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

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Metric title="Total" value={String(personas.length)} />
        <Metric title="Activas" value={String(personasActivas)} />
        <Metric title="En registro" value={String(personasRegistro)} />
        <Metric title="En pausa" value={String(personasPausa)} />
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black">Listado de personas</h2>
            <p className="mt-1 text-sm text-slate-500">
              Busca, selecciona o edita una persona.
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
              value={estadoFiltro}
              onChange={(event) =>
                setEstadoFiltro(event.target.value as 'todos' | EstadoPersona)
              }
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
            >
              <option value="todos">Todos</option>
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
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {personasFiltradas.map((persona) => (
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
                      </div>
                    </td>
                  </tr>
                ))}

                {personasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                      No se encontraron personas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tarjetas en móvil */}
          <div className="space-y-3 md:hidden">
            {personasFiltradas.map((persona) => (
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

                  <div className="min-w-0 text-right">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Objetivo
                    </p>
                    <p className="truncate text-sm font-black text-slate-700">
                      {persona.objetivo || 'Sin objetivo'}
                    </p>
                  </div>
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
                </div>
              </article>
            ))}

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
    </div>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
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
