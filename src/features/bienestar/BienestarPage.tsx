import { useMemo, useState, type ElementType, type FormEvent } from 'react'
import {
  Activity,
  Droplets,
  Heart,
  Moon,
  Plus,
  Search,
  Smile,
  UserRound,
} from 'lucide-react'
import type { RegistroBienestar } from '@/shared/types/bienestar'
import type { Persona } from '@/shared/types/persona'

interface Props {
  personas: Persona[]
  registros: RegistroBienestar[]
  onCreateRegistro: (registro: RegistroBienestar) => void
}

type EstadoAnimo =
  | 'Excelente'
  | 'Bien'
  | 'Normal'
  | 'Cansado'
  | 'Estresado'
  | 'Bajo de ánimo'

type FiltroEstado = 'todos' | EstadoAnimo

const estadosAnimo: EstadoAnimo[] = [
  'Excelente',
  'Bien',
  'Normal',
  'Cansado',
  'Estresado',
  'Bajo de ánimo',
]

const initialForm = {
  personaId: '',
  estadoAnimo: 'Bien' as EstadoAnimo,
  horasSueno: '7',
  vasosAgua: '6',
  energia: '7',
  nota: '',
}

export function BienestarPage({ personas, registros, onCreateRegistro }: Props) {
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos')
  const [form, setForm] = useState(initialForm)

  const personasActivas = useMemo(
    () => personas.filter((persona) => persona.estado === 'activa'),
    [personas],
  )

  const registrosOrdenados = useMemo(
    () =>
      [...registros].sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      ),
    [registros],
  )

  const registrosFiltrados = useMemo(() => {
    const term = search.toLowerCase().trim()

    return registrosOrdenados.filter((registro) => {
      const persona = personas.find((item) => item.id === registro.personaId)

      const matchSearch =
        !term ||
        `${persona?.nombres ?? ''} ${persona?.apellidos ?? ''} ${
          persona?.documento ?? ''
        } ${registro.estadoAnimo} ${registro.nota ?? ''}`
          .toLowerCase()
          .includes(term)

      const matchEstado =
        filtroEstado === 'todos' || registro.estadoAnimo === filtroEstado

      return matchSearch && matchEstado
    })
  }, [registrosOrdenados, personas, search, filtroEstado])

  const registrosHoy = registros.filter(
    (registro) => registro.fecha.slice(0, 10) === getToday(),
  ).length

  const promedioSueno = promedio(registros.map((registro) => registro.horasSueno))
  const promedioAgua = promedio(registros.map((registro) => registro.vasosAgua))
  const promedioEnergia = promedio(registros.map((registro) => registro.energia))

  const personasConBienestar = new Set(registros.map((registro) => registro.personaId)).size

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.personaId) {
      alert('Selecciona una persona.')
      return
    }

    const horasSueno = Number(form.horasSueno)
    const vasosAgua = Number(form.vasosAgua)
    const energia = Number(form.energia)

    if (!Number.isFinite(horasSueno) || horasSueno < 0 || horasSueno > 24) {
      alert('Las horas de sueño deben estar entre 0 y 24.')
      return
    }

    if (!Number.isFinite(vasosAgua) || vasosAgua < 0 || vasosAgua > 30) {
      alert('Los vasos de agua deben estar entre 0 y 30.')
      return
    }

    if (!Number.isFinite(energia) || energia < 1 || energia > 10) {
      alert('La energía debe estar entre 1 y 10.')
      return
    }

    onCreateRegistro({
      id: crypto.randomUUID(),
      personaId: form.personaId,
      fecha: new Date().toISOString(),
      estadoAnimo: form.estadoAnimo,
      horasSueno,
      vasosAgua,
      energia,
      nota: form.nota.trim() || undefined,
    })

    setForm(initialForm)
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-sm">
        <p className="text-sm text-slate-300">Módulo Bienestar</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">
          Acompaña más que el entrenamiento
        </h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          El bienestar permite observar señales importantes: sueño, hidratación, energía,
          estado de ánimo y notas de seguimiento. Esto será clave para la IA de ORIGEN.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric icon={Heart} title="Registros totales" value={registros.length} />
        <Metric icon={Activity} title="Registros hoy" value={registrosHoy} />
        <Metric icon={UserRound} title="Personas con bienestar" value={personasConBienestar} />
        <Metric icon={Smile} title="Energía promedio" value={`${promedioEnergia}/10`} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SignalCard
          icon={Moon}
          title="Sueño promedio"
          value={`${promedioSueno} horas`}
          description="Ayuda a entender recuperación y fatiga."
        />

        <SignalCard
          icon={Droplets}
          title="Agua promedio"
          value={`${promedioAgua} vasos`}
          description="Señal básica de hábitos diarios."
        />

        <SignalCard
          icon={Activity}
          title="Energía promedio"
          value={`${promedioEnergia}/10`}
          description="Indicador rápido de disposición física."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-black">Registrar bienestar</h2>
            <p className="mt-1 text-sm text-slate-500">
              Guarda una señal rápida del estado de la persona.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Persona</span>
              <select
                value={form.personaId}
                onChange={(event) => setForm({ ...form, personaId: event.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
              >
                <option value="">Seleccionar persona</option>
                {personasActivas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.nombres} {persona.apellidos}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Estado de ánimo</span>
              <select
                value={form.estadoAnimo}
                onChange={(event) =>
                  setForm({ ...form, estadoAnimo: event.target.value as EstadoAnimo })
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
              >
                {estadosAnimo.map((estado) => (
                  <option key={estado}>{estado}</option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-3">
              <Input
                label="Sueño"
                suffix="horas"
                type="number"
                value={form.horasSueno}
                onChange={(value) => setForm({ ...form, horasSueno: value })}
              />

              <Input
                label="Agua"
                suffix="vasos"
                type="number"
                value={form.vasosAgua}
                onChange={(value) => setForm({ ...form, vasosAgua: value })}
              />

              <Input
                label="Energía"
                suffix="1 a 10"
                type="number"
                value={form.energia}
                onChange={(value) => setForm({ ...form, energia: value })}
              />
            </div>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Nota</span>
              <textarea
                value={form.nota}
                onChange={(event) => setForm({ ...form, nota: event.target.value })}
                placeholder="Ej: durmió poco, llegó motivado, reporta cansancio, se siente mejor..."
                className="mt-1 min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
              />
            </label>

            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-black text-white hover:bg-slate-800">
              <Plus size={18} />
              Guardar bienestar
            </button>
          </form>

          {personasActivas.length === 0 && (
            <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-700">
              Primero registra personas activas para poder guardar bienestar.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-2xl font-black">Historial de bienestar</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Consulta las señales recientes de cada persona.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative min-w-[280px]">
                  <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar persona o nota"
                    className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-slate-950"
                  />
                </div>

                <select
                  value={filtroEstado}
                  onChange={(event) => setFiltroEstado(event.target.value as FiltroEstado)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                >
                  <option value="todos">Todos los estados</option>
                  {estadosAnimo.map((estado) => (
                    <option key={estado}>{estado}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {registrosFiltrados.map((registro) => {
                const persona = personas.find((item) => item.id === registro.personaId)

                return (
                  <article key={registro.id} className="rounded-[2rem] border border-slate-200 p-5">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black">
                            {persona
                              ? `${persona.nombres} ${persona.apellidos}`
                              : 'Persona no encontrada'}
                          </h3>

                          <EstadoBadge estado={registro.estadoAnimo} />
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          {formatDate(registro.fecha)}
                        </p>

                        <p className="mt-4 text-sm leading-6 text-slate-600">
                          {registro.nota || 'Sin nota adicional.'}
                        </p>
                      </div>

                      <div className="grid min-w-[280px] gap-3 md:grid-cols-3 lg:grid-cols-1">
                        <Mini label="Sueño" value={`${registro.horasSueno} horas`} />
                        <Mini label="Agua" value={`${registro.vasosAgua} vasos`} />
                        <Mini label="Energía" value={`${registro.energia}/10`} />
                      </div>
                    </div>
                  </article>
                )
              })}

              {registrosFiltrados.length === 0 && (
                <div className="rounded-[2rem] border border-dashed border-slate-300 p-12 text-center">
                  <p className="font-black text-slate-700">No hay registros para mostrar</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Guarda un registro o ajusta el filtro.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <InfoCard
              title="Lectura comercial"
              description="Este módulo ayuda a que el gimnasio no solo entrene cuerpos, sino que acompañe hábitos y bienestar."
            />

            <InfoCard
              title="IA futura"
              description="La IA podrá detectar señales como bajo sueño, baja energía o poca constancia para sugerir acompañamiento."
            />
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
  suffix,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  suffix?: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
      />
      {suffix && <span className="mt-1 block text-xs font-bold text-slate-400">{suffix}</span>}
    </label>
  )
}

function Metric({
  icon: Icon,
  title,
  value,
}: {
  icon: ElementType
  title: string
  value: number | string
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

function SignalCard({
  icon: Icon,
  title,
  value,
  description,
}: {
  icon: ElementType
  title: string
  value: string
  description: string
}) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
        <Icon size={22} />
      </div>
      <p className="mt-5 text-sm font-bold text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-black text-slate-900">{value}</p>
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
      {estado}
    </span>
  )
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <p className="text-lg font-black">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}

function promedio(values: number[]) {
  if (values.length === 0) return 0

  const total = values.reduce((acc, value) => acc + value, 0)

  return Number((total / values.length).toFixed(1))
}

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}