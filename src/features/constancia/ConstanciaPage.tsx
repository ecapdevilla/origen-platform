import { useMemo, useState } from 'react'
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Flame,
  Search,
  UserCheck,
  Users,
} from 'lucide-react'
import type { Constancia } from '@/shared/types/constancia'
import type { Persona } from '@/shared/types/persona'

interface Props {
  personas: Persona[]
  constancias: Constancia[]
  onMarcarConstancia: (personaId: string) => void
}

type FiltroConstancia = 'todos' | 'marcados' | 'pendientes'

export function ConstanciaPage({ personas, constancias, onMarcarConstancia }: Props) {
  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState<FiltroConstancia>('todos')

  const today = getToday()

  const constanciasHoy = useMemo(
    () => constancias.filter((constancia) => normalizeDate(constancia.fecha) === today),
    [constancias, today],
  )

  const personasActivas = useMemo(
    () => personas.filter((persona) => persona.estado === 'activa'),
    [personas],
  )

  const personasConConstanciaHoy = new Set(
    constanciasHoy.map((constancia) => constancia.personaId),
  )

  const totalMarcadasHoy = personasConConstanciaHoy.size
  const totalPendientesHoy = Math.max(personasActivas.length - totalMarcadasHoy, 0)
  const porcentajeHoy =
    personasActivas.length > 0 ? Math.round((totalMarcadasHoy / personasActivas.length) * 100) : 0

  const personasFiltradas = useMemo(() => {
    const term = search.toLowerCase().trim()

    return personasActivas.filter((persona) => {
      const yaMarcoHoy = personasConConstanciaHoy.has(persona.id)

      const matchSearch =
        !term ||
        `${persona.nombres} ${persona.apellidos} ${persona.documento} ${persona.telefono} ${persona.correo}`
          .toLowerCase()
          .includes(term)

      const matchFiltro =
        filtro === 'todos' ||
        (filtro === 'marcados' && yaMarcoHoy) ||
        (filtro === 'pendientes' && !yaMarcoHoy)

      return matchSearch && matchFiltro
    })
  }, [personasActivas, personasConConstanciaHoy, search, filtro])

  const mejorRacha = useMemo(() => {
    if (personas.length === 0) return null

    const ranking = personas.map((persona) => {
      const misConstancias = constancias.filter((constancia) => constancia.personaId === persona.id)

      return {
        persona,
        racha: calcularRachaActual(misConstancias),
        total: misConstancias.length,
      }
    })

    return ranking.sort((a, b) => b.racha - a.racha || b.total - a.total)[0]
  }, [personas, constancias])

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-sm">
        <p className="text-sm text-slate-300">Módulo Constancia</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">
          Acompaña la asistencia de hoy
        </h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          La constancia no es solo una entrada al gimnasio. Es una señal de compromiso,
          progreso y hábito en construcción.
        </p>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${porcentajeHoy}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
          <span>{porcentajeHoy}% de asistencia registrada hoy</span>
          <span>
            {totalMarcadasHoy} de {personasActivas.length}
          </span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric
          title="Personas activas"
          value={personasActivas.length}
          icon={Users}
        />

        <Metric
          title="Constancias hoy"
          value={totalMarcadasHoy}
          icon={CalendarCheck}
        />

        <Metric
          title="Pendientes hoy"
          value={totalPendientesHoy}
          icon={Clock}
        />

        <Metric
          title="Mejor racha"
          value={mejorRacha ? `${mejorRacha.racha} días` : '0 días'}
          icon={Flame}
        />
      </section>

      {mejorRacha && mejorRacha.racha > 0 && (
        <section className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-black text-slate-500">Reconocimiento ORIGEN</p>
              <h2 className="mt-1 text-2xl font-black">
                {mejorRacha.persona.nombres} {mejorRacha.persona.apellidos} lleva una racha de{' '}
                {mejorRacha.racha} días 🔥
              </h2>
              <p className="mt-2 text-slate-500">
                Este tipo de señales luego serán usadas para logros, mensajes automáticos y
                acompañamiento inteligente.
              </p>
            </div>

            <div className="rounded-[2rem] bg-slate-50 px-6 py-4 text-center">
              <p className="text-4xl font-black">{mejorRacha.total}</p>
              <p className="text-sm font-bold text-slate-500">asistencias totales</p>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-2xl font-black">Registro de hoy</h2>
            <p className="mt-1 text-sm text-slate-500">
              Marca la constancia de las personas activas.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative min-w-[280px]">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar persona"
                className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-slate-900"
              />
            </div>

            <select
              value={filtro}
              onChange={(event) => setFiltro(event.target.value as FiltroConstancia)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
            >
              <option value="todos">Todas</option>
              <option value="marcados">Marcadas hoy</option>
              <option value="pendientes">Pendientes</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {personasFiltradas.map((persona) => {
            const misConstancias = constancias.filter(
              (constancia) => constancia.personaId === persona.id,
            )

            const yaMarcoHoy = personasConConstanciaHoy.has(persona.id)
            const rachaActual = calcularRachaActual(misConstancias)
            const ultimaConstancia = obtenerUltimaConstancia(misConstancias)

            return (
              <article
                key={persona.id}
                className="rounded-[2rem] border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-black ${
                        yaMarcoHoy
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {persona.nombres.charAt(0)}
                      {persona.apellidos.charAt(0)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black">
                          {persona.nombres} {persona.apellidos}
                        </h3>

                        {yaMarcoHoy && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                            <CheckCircle2 size={14} />
                            Marcada hoy
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {persona.objetivo} · Documento {persona.documento}
                      </p>

                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <Mini label="Asistencias" value={String(misConstancias.length)} />
                        <Mini label="Racha actual" value={`${rachaActual} días`} />
                        <Mini
                          label="Última asistencia"
                          value={
                            ultimaConstancia
                              ? formatDate(normalizeDate(ultimaConstancia.fecha))
                              : 'Sin registro'
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={yaMarcoHoy}
                    onClick={() => onMarcarConstancia(persona.id)}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-black transition ${
                      yaMarcoHoy
                        ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                        : 'bg-slate-950 text-white hover:bg-slate-800'
                    }`}
                  >
                    <UserCheck size={18} />
                    {yaMarcoHoy ? 'Ya marcada' : 'Marcar constancia'}
                  </button>
                </div>
              </article>
            )
          })}

          {personasFiltradas.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-slate-300 p-12 text-center">
              <p className="font-black text-slate-700">No hay personas para mostrar</p>
              <p className="mt-2 text-sm text-slate-500">
                Ajusta el buscador o el filtro de constancia.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black">Últimas constancias registradas</h2>
        <p className="mt-1 text-sm text-slate-500">
          Historial reciente de registros de asistencia.
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Persona</th>
                <th className="px-4 py-3">Registrado por</th>
              </tr>
            </thead>

            <tbody>
              {constancias.slice(0, 12).map((constancia) => {
                const persona = personas.find((item) => item.id === constancia.personaId)

                return (
                  <tr key={constancia.id} className="border-t border-slate-100">
                    <td className="px-4 py-4">
                      {formatDate(normalizeDate(constancia.fecha))}
                    </td>
                    <td className="px-4 py-4 font-black">
                      {persona
                        ? `${persona.nombres} ${persona.apellidos}`
                        : 'Persona no encontrada'}
                    </td>
                    <td className="px-4 py-4 capitalize">{constancia.registradoPor}</td>
                  </tr>
                )
              })}

              {constancias.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-slate-500">
                    Todavía no hay constancias registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Metric({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: number | string
  icon: React.ElementType
}) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
        <Icon size={22} />
      </div>
      <p className="mt-5 text-sm font-bold text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-black text-slate-900">{value}</p>
    </div>
  )
}

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeDate(date: string) {
  return date.slice(0, 10)
}

function obtenerUltimaConstancia(constancias: Constancia[]) {
  return [...constancias].sort(
    (a, b) => new Date(normalizeDate(b.fecha)).getTime() - new Date(normalizeDate(a.fecha)).getTime(),
  )[0]
}

function calcularRachaActual(constancias: Constancia[]) {
  const fechas = new Set(constancias.map((constancia) => normalizeDate(constancia.fecha)))

  let racha = 0
  const cursor = new Date()

  while (true) {
    const yyyyMmDd = cursor.toISOString().slice(0, 10)

    if (!fechas.has(yyyyMmDd)) {
      break
    }

    racha += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return racha
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}