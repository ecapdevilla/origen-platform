import { useEffect, useMemo, useState } from 'react'
import { listarRegistrosBienestar } from '@/features/bienestar/bienestarApi'
import { listarMovimientosCaja } from '@/features/comercial/comercialApi'
import {
  crearConstanciaSupabase,
  listarConstancias,
} from '@/features/constancia/constanciasApi'
import { listarPlanesEntrenamiento } from '@/features/entrenamiento/entrenamientoApi'
import { listarMedidasCorporales } from '@/features/personas/medidasApi'
import { listarPersonas } from '@/features/personas/personasApi'
import type { SesionUsuario } from '@/shared/types/auth'
import type { RegistroBienestar } from '@/shared/types/bienestar'
import type { MovimientoCaja } from '@/shared/types/comercial'
import type { Constancia } from '@/shared/types/constancia'
import type { PlanEntrenamiento } from '@/shared/types/entrenamiento'
import type { Persona } from '@/shared/types/persona'
import type { MedidaCorporal } from '@/shared/types/progreso'

interface Props {
  usuario: SesionUsuario
  onLogout: () => void
}

export function PersonaPortalPage({ usuario, onLogout }: Props) {
  const [persona, setPersona] = useState<Persona | null>(null)
  const [constancias, setConstancias] = useState<Constancia[]>([])
  const [planes, setPlanes] = useState<PlanEntrenamiento[]>([])
  const [registrosBienestar, setRegistrosBienestar] = useState<RegistroBienestar[]>([])
  const [medidas, setMedidas] = useState<MedidaCorporal[]>([])
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([])
  const [loading, setLoading] = useState(true)

  const hoy = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    let mounted = true

    async function cargarDatos() {
      try {
        setLoading(true)

        if (!usuario.personaId) {
          if (mounted) {
            setPersona(null)
          }

          return
        }

        const [
          personasData,
          constanciasData,
          planesData,
          bienestarData,
          medidasData,
          movimientosData,
        ] = await Promise.all([
          listarPersonas(),
          listarConstancias(),
          listarPlanesEntrenamiento(),
          listarRegistrosBienestar(),
          listarMedidasCorporales(),
          listarMovimientosCaja(),
        ])

        if (!mounted) return

        const personaEncontrada =
          personasData.find((item) => item.id === usuario.personaId) || null

        setPersona(personaEncontrada)
        setConstancias(constanciasData)
        setPlanes(planesData)
        setRegistrosBienestar(bienestarData)
        setMedidas(medidasData)
        setMovimientos(movimientosData)
      } catch (error) {
        console.error('Error cargando portal persona:', error)
        alert('No se pudieron cargar los datos del portal persona.')
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
  }, [usuario.personaId])

  const constanciaHoy = useMemo(() => {
    if (!persona) return undefined

    return constancias.find(
      (constancia) =>
        constancia.personaId === persona.id && constancia.fecha.slice(0, 10) === hoy,
    )
  }, [constancias, persona, hoy])

  const constanciasPersona = useMemo(() => {
    if (!persona) return []

    return constancias
      .filter((constancia) => constancia.personaId === persona.id)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [constancias, persona])

  const planActivo = useMemo(() => {
    if (!persona) return undefined

    return planes.find(
      (plan) => plan.personaId === persona.id && plan.estado === 'activo',
    )
  }, [planes, persona])

  const registrosPersona = useMemo(() => {
    if (!persona) return []

    return registrosBienestar
      .filter((registro) => registro.personaId === persona.id)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [registrosBienestar, persona])

  const ultimoBienestar = registrosPersona[0]

  const medidasPersona = useMemo(() => {
    if (!persona) return []

    return medidas
      .filter((medida) => medida.personaId === persona.id)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [medidas, persona])

  const ultimaMedida = medidasPersona[0]

  const pagosPersona = useMemo(() => {
    if (!persona) return []

    return movimientos
      .filter((movimiento) => movimiento.personaId === persona.id)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [movimientos, persona])

  const totalPagado = pagosPersona
    .filter((movimiento) => movimiento.tipo === 'ingreso')
    .reduce((total, movimiento) => total + movimiento.valor, 0)

  async function marcarConstanciaPropia() {
    if (!persona) return

    if (constanciaHoy) {
      alert('Ya tienes tu constancia marcada hoy.')
      return
    }

    try {
      const nuevaConstancia = await crearConstanciaSupabase(persona.id, 'persona')

      setConstancias((current) => [nuevaConstancia, ...current])
    } catch (error) {
      console.error('Error marcando constancia desde portal persona:', error)
      alert('No se pudo marcar la constancia.')
    }
  }
    if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-100 p-6">
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-surface-500">ORIGEN</p>

          <h1 className="mt-2 text-2xl font-black text-surface-950">
            Cargando portal persona
          </h1>

          <p className="mt-3 text-sm text-surface-500">
            Consultando tu constancia, plan, bienestar, medidas y pagos desde Supabase.
          </p>
        </div>
      </div>
    )
  }

  if (!usuario.personaId || !persona) {
    return (
      <div className="min-h-screen bg-surface-100 p-6">
        <div className="mx-auto max-w-5xl">
          <header className="flex flex-col gap-4 rounded-[2rem] bg-surface-950 p-8 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-surface-300">ORIGEN</p>

              <h1 className="mt-2 text-3xl font-black">Portal Persona</h1>

              <p className="mt-2 text-sm text-surface-300">{usuario.nombre}</p>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-surface-950 hover:bg-surface-100"
            >
              Cerrar sesión
            </button>
          </header>

          <section className="mt-6 rounded-[2rem] bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-black text-surface-950">
              Tu usuario no está enlazado a una persona
            </h2>

            <p className="mt-3 text-surface-500">
              Un administrador debe ir a Usuarios y Roles, editar tu usuario y
              seleccionar la persona enlazada.
            </p>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-100">
      <header className="bg-surface-950 p-6 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-surface-300">ORIGEN</p>

            <h1 className="mt-2 text-3xl font-black">Portal Persona</h1>

            <p className="mt-2 text-sm text-surface-300">
              Revisa tu constancia, plan, bienestar, progreso y pagos.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs text-surface-300">Sesión</p>
              <p className="text-sm font-black">{usuario.nombre}</p>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-surface-950 hover:bg-surface-100"
            >
              Salir
            </button>
          </div>
        </div>
      </header>


      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div>
              <p className="text-sm font-bold text-surface-500">Mi perfil</p>

              <h2 className="mt-2 text-4xl font-black text-surface-950">
                {persona.nombres} {persona.apellidos}
              </h2>

              <p className="mt-3 max-w-2xl text-surface-500">{persona.objetivo}</p>


              <div className="mt-5 flex flex-wrap gap-2">
                <Badge label={`Documento ${persona.documento}`} />
                <Badge label={persona.telefono || 'Sin teléfono'} />
                <Badge label={persona.correo || 'Sin correo'} />
                <Badge label={`Estado: ${persona.estado}`} />
              </div>
            </div>

            <button
              type="button"
              onClick={marcarConstanciaPropia}
              disabled={Boolean(constanciaHoy)}
              className={`rounded-2xl px-6 py-4 text-sm font-black ${
                constanciaHoy
                  ? 'cursor-not-allowed bg-surface-100 text-surface-400'
                  : 'bg-surface-950 text-white hover:bg-surface-800'
              }`}

            >
              {constanciaHoy ? 'Constancia marcada hoy' : 'Marcar mi constancia'}
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric title="Constancias" value={String(constanciasPersona.length)} />
          <Metric title="Hoy" value={constanciaHoy ? 'Marcada' : 'Pendiente'} />
          <Metric title="Plan activo" value={planActivo ? 'Sí' : 'No'} />
          <Metric title="Total pagado" value={formatMoney(totalPagado)} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-black text-surface-950">
              Mi plan de entrenamiento
            </h3>

            {planActivo ? (
              <div className="mt-5 rounded-2xl bg-surface-50 p-5">
                <p className="text-xl font-black">{planActivo.nombre}</p>

                <p className="mt-2 text-sm font-bold text-surface-700">
                  {planActivo.objetivo}
                </p>

                <p className="mt-3 text-sm leading-6 text-surface-500">
                  {planActivo.descripcion}
                </p>


                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Mini label="Días semana" value={String(planActivo.diasSemana)} />
                  <Mini label="Estado" value={planActivo.estado} />
                </div>
              </div>
            ) : (
              <Empty message="Todavía no tienes un plan activo." />
            )}
          </article>

          <article className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-black text-surface-950">
              Mi último bienestar
            </h3>

            {ultimoBienestar ? (
              <div className="mt-5 rounded-2xl bg-surface-50 p-5">
                <p className="text-xl font-black">{ultimoBienestar.estadoAnimo}</p>

                <p className="mt-2 text-sm text-surface-500">
                  {formatDate(ultimoBienestar.fecha)}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <Mini label="Energía" value={`${ultimoBienestar.energia}/10`} />
                  <Mini label="Sueño" value={`${ultimoBienestar.horasSueno} h`} />
                  <Mini label="Agua" value={`${ultimoBienestar.vasosAgua}`} />
                </div>

                {ultimoBienestar.nota && (
                  <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-surface-500">
                    {ultimoBienestar.nota}
                  </p>
                )}
              </div>
            ) : (
              <Empty message="Todavía no tienes registros de bienestar." />
            )}
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-black text-surface-950">
              Mi progreso corporal
            </h3>


            {ultimaMedida ? (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
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
              <Empty message="Todavía no tienes medidas registradas." />
            )}

            {medidasPersona.length > 0 && (
              <p className="mt-4 text-sm text-surface-500">
                Total de medidas registradas: {medidasPersona.length}
              </p>
            )}
          </article>

          <article className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-black text-surface-950">Mis pagos</h3>

            {pagosPersona.length > 0 ? (
              <div className="mt-5 space-y-3">
                {pagosPersona.slice(0, 5).map((movimiento) => (
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

                    <p className="font-black text-surface-950">
                      {formatMoney(movimiento.valor)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <Empty message="Todavía no tienes pagos registrados." />
            )}
          </article>
        </section>

        <section className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-black text-surface-950">
            Mi historial de constancia
          </h3>

          {constanciasPersona.length > 0 ? (
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {constanciasPersona.slice(0, 9).map((constancia) => (
                <div key={constancia.id} className="rounded-2xl bg-surface-50 p-4">
                  <p className="font-black text-surface-900">
                    {formatDate(constancia.fecha)}
                  </p>

                  <p className="mt-1 text-sm text-surface-500">
                    Registrado por {constancia.registradoPor}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <Empty message="Todavía no tienes constancias registradas." />
          )}
        </section>
      </main>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <p className="text-sm font-bold text-surface-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-surface-950">{value}</p>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-black uppercase tracking-wide text-surface-400">
        {label}
      </p>
      <p className="mt-1 font-black text-surface-900">{value}</p>
    </div>
  )
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-surface-100 px-3 py-1 text-xs font-black text-surface-700">
      {label}
    </span>
  )
}

function Empty({ message }: { message: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-surface-300 p-6 text-center text-sm text-surface-500">
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