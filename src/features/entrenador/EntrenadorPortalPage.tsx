import { useEffect, useMemo, useState } from 'react'
import {
  crearConstanciaSupabase,
  listarConstancias,
} from '@/features/constancia/constanciasApi'
import { listarPlanesEntrenamiento } from '@/features/entrenamiento/entrenamientoApi'
import { listarRegistrosBienestar } from '@/features/bienestar/bienestarApi'
import { listarMedidasCorporales } from '@/features/personas/medidasApi'
import { listarPersonas } from '@/features/personas/personasApi'
import type { SesionUsuario } from '@/shared/types/auth'
import type { RegistroBienestar } from '@/shared/types/bienestar'
import type { Constancia } from '@/shared/types/constancia'
import type { PlanEntrenamiento } from '@/shared/types/entrenamiento'
import type { Persona } from '@/shared/types/persona'
import type { MedidaCorporal } from '@/shared/types/progreso'

interface Props {
  usuario: SesionUsuario
  onLogout: () => void
}

export function EntrenadorPortalPage({ usuario, onLogout }: Props) {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [constancias, setConstancias] = useState<Constancia[]>([])
  const [planes, setPlanes] = useState<PlanEntrenamiento[]>([])
  const [registrosBienestar, setRegistrosBienestar] = useState<RegistroBienestar[]>([])
  const [medidas, setMedidas] = useState<MedidaCorporal[]>([])
  const [personaSeleccionadaId, setPersonaSeleccionadaId] = useState('')
  const [loading, setLoading] = useState(true)

  const hoy = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    let mounted = true

    async function cargarDatos() {
      try {
        setLoading(true)

        const [
          personasData,
          constanciasData,
          planesData,
          bienestarData,
          medidasData,
        ] = await Promise.all([
          listarPersonas(),
          listarConstancias(),
          listarPlanesEntrenamiento(),
          listarRegistrosBienestar(),
          listarMedidasCorporales(),
        ])

        if (!mounted) return

        const personasActivas = personasData.filter(
          (persona) => persona.estado === 'activa',
        )

        setPersonas(personasActivas)
        setConstancias(constanciasData)
        setPlanes(planesData)
        setRegistrosBienestar(bienestarData)
        setMedidas(medidasData)

        if (personasActivas.length > 0) {
          setPersonaSeleccionadaId(personasActivas[0].id)
        }
      } catch (error) {
        console.error('Error cargando portal entrenador:', error)
        alert('No se pudieron cargar los datos del entrenador.')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    cargarDatos()

    return () => {
      mounted = false
    }
  }, [])

  const personaSeleccionada = useMemo(() => {
    return personas.find((persona) => persona.id === personaSeleccionadaId)
  }, [personas, personaSeleccionadaId])

  const constanciaHoy = useMemo(() => {
    if (!personaSeleccionada) return undefined

    return constancias.find(
      (constancia) =>
        constancia.personaId === personaSeleccionada.id &&
        constancia.fecha.slice(0, 10) === hoy,
    )
  }, [constancias, personaSeleccionada, hoy])

  const planActivo = useMemo(() => {
    if (!personaSeleccionada) return undefined

    return planes.find(
      (plan) =>
        plan.personaId === personaSeleccionada.id && plan.estado === 'activo',
    )
  }, [planes, personaSeleccionada])

  const ultimoBienestar = useMemo(() => {
    if (!personaSeleccionada) return undefined

    return [...registrosBienestar]
      .filter((registro) => registro.personaId === personaSeleccionada.id)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0]
  }, [registrosBienestar, personaSeleccionada])

  const ultimaMedida = useMemo(() => {
    if (!personaSeleccionada) return undefined

    return [...medidas]
      .filter((medida) => medida.personaId === personaSeleccionada.id)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0]
  }, [medidas, personaSeleccionada])

  const totalConstanciasPersona = useMemo(() => {
    if (!personaSeleccionada) return 0

    return constancias.filter(
      (constancia) => constancia.personaId === personaSeleccionada.id,
    ).length
  }, [constancias, personaSeleccionada])

  async function marcarConstancia() {
    if (!personaSeleccionada) return

    if (constanciaHoy) {
      alert('Esta persona ya tiene constancia marcada hoy.')
      return
    }

    try {
      const nuevaConstancia = await crearConstanciaSupabase(
        personaSeleccionada.id,
        'admin',
      )

      setConstancias((current) => [nuevaConstancia, ...current])
    } catch (error) {
      console.error('Error marcando constancia desde entrenador:', error)
      alert('No se pudo marcar la constancia.')
    }
  }
    if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-500">ORIGEN</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950">
            Cargando portal entrenador
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Consultando personas, constancias, planes, bienestar y medidas desde Supabase.
          </p>
        </div>
      </div>
    )
  }

  if (personas.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-5xl">
          <header className="flex flex-col gap-4 rounded-[2rem] bg-slate-950 p-8 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-300">ORIGEN</p>
              <h1 className="mt-2 text-3xl font-black">Portal Entrenador</h1>
              <p className="mt-2 text-sm text-slate-300">{usuario.nombre}</p>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 hover:bg-slate-100"
            >
              Cerrar sesión
            </button>
          </header>

          <section className="mt-6 rounded-[2rem] bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              No hay personas activas
            </h2>
            <p className="mt-3 text-slate-500">
              Cuando el administrador registre personas activas, aparecerán aquí.
            </p>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-950 p-6 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-300">ORIGEN</p>
            <h1 className="mt-2 text-3xl font-black">Portal Entrenador</h1>
            <p className="mt-2 text-sm text-slate-300">
              Acompaña el proceso diario de cada persona.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs text-slate-300">Sesión</p>
              <p className="text-sm font-black">{usuario.nombre}</p>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 hover:bg-slate-100"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">Personas activas</h2>
            <p className="mt-1 text-sm text-slate-500">
              Selecciona una persona para revisar su avance.
            </p>

            <div className="mt-5 space-y-3">
              {personas.map((persona) => {
                const isActive = persona.id === personaSeleccionadaId

                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => setPersonaSeleccionadaId(persona.id)}
                    className={`w-full rounded-2xl p-4 text-left transition ${
                      isActive
                        ? 'bg-slate-950 text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <p className="font-black">
                      {persona.nombres} {persona.apellidos}
                    </p>
                    <p
                      className={`mt-1 text-sm ${
                        isActive ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {persona.objetivo}
                    </p>
                  </button>
                )
              })}
            </div>
          </section>
        </aside>

        <section className="space-y-6">
          {personaSeleccionada && (
            <>
              <section className="rounded-[2rem] bg-white p-8 shadow-sm">
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-500">Persona seleccionada</p>

                    <h2 className="mt-2 text-4xl font-black text-slate-950">
                      {personaSeleccionada.nombres} {personaSeleccionada.apellidos}
                    </h2>

                    <p className="mt-3 max-w-2xl text-slate-500">
                      {personaSeleccionada.objetivo}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Badge label={`Documento ${personaSeleccionada.documento}`} />
                      <Badge label={personaSeleccionada.telefono || 'Sin teléfono'} />
                      <Badge label={personaSeleccionada.correo || 'Sin correo'} />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={marcarConstancia}
                    disabled={Boolean(constanciaHoy)}
                    className={`rounded-2xl px-6 py-4 text-sm font-black ${
                      constanciaHoy
                        ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                        : 'bg-slate-950 text-white hover:bg-slate-800'
                    }`}
                  >
                    {constanciaHoy ? 'Constancia marcada hoy' : 'Marcar constancia'}
                  </button>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-4">
                <Metric title="Constancias" value={String(totalConstanciasPersona)} />
                <Metric
                  title="Hoy"
                  value={constanciaHoy ? 'Marcada' : 'Pendiente'}
                />
                <Metric
                  title="Plan activo"
                  value={planActivo ? planActivo.nombre : 'Sin plan'}
                />
                <Metric
                  title="Energía"
                  value={ultimoBienestar ? `${ultimoBienestar.energia}/10` : 'Sin dato'}
                />
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <article className="rounded-[2rem] bg-white p-6 shadow-sm">
                  <h3 className="text-2xl font-black text-slate-950">
                    Plan de entrenamiento
                  </h3>

                  {planActivo ? (
                    <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                      <p className="text-xl font-black">{planActivo.nombre}</p>
                      <p className="mt-2 text-sm font-bold text-slate-700">
                        {planActivo.objetivo}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        {planActivo.descripcion}
                      </p>
                      <p className="mt-4 text-sm font-black text-slate-900">
                        {planActivo.diasSemana} días por semana
                      </p>
                    </div>
                  ) : (
                    <Empty message="Esta persona todavía no tiene plan activo." />
                  )}
                </article>

                <article className="rounded-[2rem] bg-white p-6 shadow-sm">
                  <h3 className="text-2xl font-black text-slate-950">
                    Último bienestar
                  </h3>

                  {ultimoBienestar ? (
                    <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                      <p className="text-xl font-black">{ultimoBienestar.estadoAnimo}</p>
                      <p className="mt-2 text-sm text-slate-500">
                        {formatDate(ultimoBienestar.fecha)}
                      </p>

                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <Mini label="Energía" value={`${ultimoBienestar.energia}/10`} />
                        <Mini label="Sueño" value={`${ultimoBienestar.horasSueno} h`} />
                        <Mini label="Agua" value={`${ultimoBienestar.vasosAgua}`} />
                      </div>

                      {ultimoBienestar.nota && (
                        <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-500">
                          {ultimoBienestar.nota}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Empty message="No hay registros de bienestar para esta persona." />
                  )}
                </article>
              </section>

              <section className="rounded-[2rem] bg-white p-6 shadow-sm">
                <h3 className="text-2xl font-black text-slate-950">
                  Última medida corporal
                </h3>

                {ultimaMedida ? (
                  <div className="mt-5 grid gap-3 md:grid-cols-4">
                    <Mini label="Fecha" value={formatDate(ultimaMedida.fecha)} />
                    <Mini label="Peso" value={`${ultimaMedida.pesoKg} kg`} />
                    <Mini label="Estatura" value={`${ultimaMedida.estaturaCm} cm`} />
                    <Mini
                      label="Cintura"
                      value={
                        ultimaMedida.cinturaCm
                          ? `${ultimaMedida.cinturaCm} cm`
                          : 'Sin dato'
                      }
                    />
                  </div>
                ) : (
                  <Empty message="No hay medidas registradas para esta persona." />
                )}
              </section>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-black text-slate-900">{value}</p>
    </div>
  )
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
      {label}
    </span>
  )
}

function Empty({ message }: { message: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
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