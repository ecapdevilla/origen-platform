import { useMemo, useState } from 'react'
import {
  Activity,
  Dumbbell,
  Plus,
  Search,
  Target,
  UserRound,
} from 'lucide-react'
import type { PlanEntrenamiento } from '@/shared/types/entrenamiento'
import type { Persona } from '@/shared/types/persona'

interface Props {
  personas: Persona[]
  planes: PlanEntrenamiento[]
  onCreatePlan: (plan: PlanEntrenamiento) => void
}

type EstadoPlan = PlanEntrenamiento['estado']
type FiltroEstado = 'todos' | EstadoPlan

const objetivos = [
  'Aumentar masa muscular',
  'Reducir grasa corporal',
  'Ganar fuerza',
  'Mejorar condición física',
  'Tonificación',
  'Movilidad y salud',
  'Reacondicionamiento',
]

const initialForm = {
  personaId: '',
  nombre: '',
  objetivo: objetivos[0],
  diasSemana: '3',
  descripcion: '',
}

export function EntrenamientoPage({ personas, planes, onCreatePlan }: Props) {
  const [search, setSearch] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<FiltroEstado>('todos')
  const [form, setForm] = useState(initialForm)

  const personasActivas = useMemo(
    () => personas.filter((persona) => persona.estado === 'activa'),
    [personas],
  )

  const planesFiltrados = useMemo(() => {
    const term = search.toLowerCase().trim()

    return planes.filter((plan) => {
      const persona = personas.find((item) => item.id === plan.personaId)

      const matchSearch =
        !term ||
        `${plan.nombre} ${plan.objetivo} ${plan.descripcion} ${persona?.nombres ?? ''} ${
          persona?.apellidos ?? ''
        }`
          .toLowerCase()
          .includes(term)

      const matchEstado = estadoFiltro === 'todos' || plan.estado === estadoFiltro

      return matchSearch && matchEstado
    })
  }, [planes, personas, search, estadoFiltro])

  const planesSugeridos = planes.filter((plan) => plan.estado === 'sugerido').length
  const planesActivos = planes.filter((plan) => plan.estado === 'activo').length
  const personasConPlan = new Set(planes.map((plan) => plan.personaId)).size

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.personaId) {
      alert('Selecciona una persona.')
      return
    }

    if (!form.nombre.trim()) {
      alert('Ingresa el nombre del plan.')
      return
    }

    if (!form.descripcion.trim()) {
      alert('Describe el plan de entrenamiento.')
      return
    }

    const diasSemana = Number(form.diasSemana)

    if (!Number.isFinite(diasSemana) || diasSemana <= 0 || diasSemana > 7) {
      alert('Los días por semana deben estar entre 1 y 7.')
      return
    }

    onCreatePlan({
      id: crypto.randomUUID(),
      personaId: form.personaId,
      nombre: form.nombre.trim(),
      objetivo: form.objetivo,
      diasSemana,
      descripcion: form.descripcion.trim(),
      estado: 'sugerido',
      fechaCreacion: new Date().toISOString(),
    })

    setForm(initialForm)
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 p-6 text-white shadow-[0_20px_70px_-25px_rgba(15,23,42,0.35)] sm:p-8">
        <p className="text-sm text-slate-300">Módulo Entrenamiento</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">
          Planes que acompañan objetivos reales
        </h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Aquí se crean planes orientativos para acompañar el proceso de cada persona. Más adelante
          conectaremos rutinas por día, ejercicios, series, cargas, observaciones y seguimiento del
          entrenador.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric icon={Dumbbell} title="Planes totales" value={planes.length} />
        <Metric icon={Activity} title="Planes activos" value={planesActivos} />
        <Metric icon={UserRound} title="Personas con plan" value={personasConPlan} />
        <Metric icon={Target} title="Sugeridos" value={planesSugeridos} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-2xl font-black">Crear plan</h2>
            <p className="mt-1 text-sm text-slate-500">
              Registra un plan inicial para una persona activa.
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

            <Input
              label="Nombre del plan"
              placeholder="Ej: Fuerza inicial 4 semanas"
              value={form.nombre}
              onChange={(value) => setForm({ ...form, nombre: value })}
            />

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Objetivo</span>
              <select
                value={form.objetivo}
                onChange={(event) => setForm({ ...form, objetivo: event.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
              >
                {objetivos.map((objetivo) => (
                  <option key={objetivo}>{objetivo}</option>
                ))}
              </select>
            </label>

            <Input
              label="Días por semana"
              type="number"
              value={form.diasSemana}
              onChange={(value) => setForm({ ...form, diasSemana: value })}
            />

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Descripción del plan</span>
              <textarea
                value={form.descripcion}
                onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
                placeholder="Describe el enfoque del plan, recomendaciones, días de trabajo y observaciones."
                className="mt-1 min-h-36 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
              />
            </label>

            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-black text-white hover:bg-slate-800">
              <Plus size={18} />
              Crear plan sugerido
            </button>
          </form>

          {personasActivas.length === 0 && (
            <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-700">
              Primero registra una persona activa para poder crear planes.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-2xl font-black">Planes de entrenamiento</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Consulta los planes creados y su estado actual.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative min-w-[280px]">
                  <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar plan o persona"
                    className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-slate-950"
                  />
                </div>

                <select
                  value={estadoFiltro}
                  onChange={(event) => setEstadoFiltro(event.target.value as FiltroEstado)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="sugerido">Sugerido</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="activo">Activo</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {planesFiltrados.map((plan) => {
                const persona = personas.find((item) => item.id === plan.personaId)

                return (
                  <article key={plan.id} className="rounded-[2rem] border border-slate-200 p-5">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black">{plan.nombre}</h3>
                          <EstadoBadge estado={plan.estado} />
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          {persona
                            ? `${persona.nombres} ${persona.apellidos}`
                            : 'Persona no encontrada'}
                        </p>

                        <p className="mt-4 text-sm leading-6 text-slate-600">
                          {plan.descripcion}
                        </p>
                      </div>

                      <div className="grid min-w-[260px] gap-3">
                        <Mini label="Objetivo" value={plan.objetivo} />
                        <Mini label="Días / semana" value={`${plan.diasSemana} días`} />
                        <Mini
                          label="Fecha creación"
                          value={new Date(plan.fechaCreacion).toLocaleDateString('es-CO')}
                        />
                      </div>
                    </div>
                  </article>
                )
              })}

              {planesFiltrados.length === 0 && (
                <div className="rounded-[2rem] border border-dashed border-slate-300 p-12 text-center">
                  <p className="font-black text-slate-700">No hay planes para mostrar</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Crea un plan o ajusta el filtro de búsqueda.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <InfoCard
              title="Siguiente mejora"
              description="Después agregaremos rutinas por día, ejercicios, series, repeticiones y cargas."
            />
            <InfoCard
              title="IA futura"
              description="ORIGEN podrá sugerir ajustes de entrenamiento según constancia, bienestar y progreso."
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
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
      />
    </label>
  )
}

function Metric({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ElementType
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

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-black text-slate-900">{value}</p>
    </div>
  )
}

function EstadoBadge({ estado }: { estado: EstadoPlan }) {
  const labelByEstado: Record<EstadoPlan, string> = {
    sugerido: 'Sugerido',
    aprobado: 'Aprobado',
    activo: 'Activo',
    finalizado: 'Finalizado',
  }

  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
      {labelByEstado[estado]}
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