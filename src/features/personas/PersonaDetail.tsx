import { useMemo, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  CalendarCheck,
  Dumbbell,
  Heart,
  Pencil,
  Ruler,
  Wallet,
} from 'lucide-react'
import type { RegistroBienestar } from '@/shared/types/bienestar'
import type { MovimientoCaja } from '@/shared/types/comercial'
import type { Constancia } from '@/shared/types/constancia'
import type { PlanEntrenamiento } from '@/shared/types/entrenamiento'
import type { EstadoPersona, Persona } from '@/shared/types/persona'
import type { MedidaCorporal } from '@/shared/types/progreso'

interface Props {
  persona: Persona
  constancias: Constancia[]
  movimientos: MovimientoCaja[]
  planes: PlanEntrenamiento[]
  registrosBienestar: RegistroBienestar[]
  medidas: MedidaCorporal[]
  onChangeEstado: (id: string, estado: EstadoPersona) => void
  onCreateMedida: (medida: MedidaCorporal) => void
  onEditar: (persona: Persona) => void
  onVolver: () => void
}

type Seccion = 'resumen' | 'medidas' | 'pagos' | 'bienestar' | 'plan' | 'constancias'

const secciones: { id: Seccion; label: string; icon: React.ElementType }[] = [
  { id: 'resumen', label: 'Resumen', icon: Heart },
  { id: 'medidas', label: 'Medidas', icon: Ruler },
  { id: 'pagos', label: 'Pagos', icon: Wallet },
  { id: 'bienestar', label: 'Bienestar', icon: Heart },
  { id: 'plan', label: 'Plan', icon: Dumbbell },
  { id: 'constancias', label: 'Constancias', icon: CalendarCheck },
]

const estadoOptions: EstadoPersona[] = ['activa', 'en_pausa', 'registro', 'historica']

export function PersonaDetail({
  persona,
  constancias,
  movimientos,
  planes,
  registrosBienestar,
  medidas,
  onChangeEstado,
  onCreateMedida,
  onEditar,
  onVolver,
}: Props) {
  const [seccion, setSeccion] = useState<Seccion>('resumen')

  const constanciasPersona = useMemo(
    () =>
      constancias
        .filter((constancia) => constancia.personaId === persona.id)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [constancias, persona.id],
  )

  const movimientosPersona = useMemo(
    () =>
      movimientos
        .filter((movimiento) => movimiento.personaId === persona.id)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [movimientos, persona.id],
  )

  const bienestarPersona = useMemo(
    () =>
      registrosBienestar
        .filter((registro) => registro.personaId === persona.id)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [registrosBienestar, persona.id],
  )

  const medidasPersona = useMemo(
    () =>
      medidas
        .filter((medida) => medida.personaId === persona.id)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [medidas, persona.id],
  )

  const planPersona = useMemo(
    () => planes.find((plan) => plan.personaId === persona.id) ?? null,
    [planes, persona.id],
  )

  const ultimaMedida = medidasPersona[0] ?? null

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-surface-800 bg-surface-950 p-6 text-white shadow-[0_20px_70px_-25px_rgba(28,25,23,0.35)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <button
              type="button"
              onClick={onVolver}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/20"
            >
              <ArrowLeft size={16} />
              Volver al listado
            </button>

            <h1 className="mt-5 text-3xl font-black sm:text-4xl">
              {persona.nombres} {persona.apellidos}
            </h1>

            <p className="mt-2 text-sm text-surface-300">
              {persona.documento} · {persona.correo || 'Sin correo'}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${estadoBadgeClass(
                  persona.estado,
                )}`}
              >
                {estadoLabel(persona.estado)}
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-surface-200">
                Registro: {persona.fechaRegistro}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => onEditar(persona)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-700"
            >
              <Pencil size={16} />
              Editar
            </button>

            <select
              value={persona.estado}
              onChange={(event) =>
                onChangeEstado(persona.id, event.target.value as EstadoPersona)
              }
              className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white outline-none"
            >
              {estadoOptions.map((estado) => (
                <option key={estado} value={estado} className="text-surface-900">
                  {estadoLabel(estado)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Sub-pestañas */}
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {secciones.map(({ id, label, icon: Icon }) => {
          const isActive = seccion === id

          return (
            <button
              key={id}
              type="button"
              onClick={() => setSeccion(id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'border border-surface-200 bg-white text-surface-600 hover:bg-surface-50'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          )
        })}
      </nav>


      {seccion === 'resumen' && (
        <ResumenSeccion
          persona={persona}
          constancias={constanciasPersona}
          movimientos={movimientosPersona}
          bienestar={bienestarPersona}
          ultimaMedida={ultimaMedida}
        />
      )}

      {seccion === 'medidas' && (
        <MedidasSeccion
          personaId={persona.id}
          medidas={medidasPersona}
          onCreateMedida={onCreateMedida}
        />
      )}

      {seccion === 'pagos' && <PagosSeccion movimientos={movimientosPersona} />}

      {seccion === 'bienestar' && <BienestarSeccion registros={bienestarPersona} />}

      {seccion === 'plan' && <PlanSeccion plan={planPersona} />}

      {seccion === 'constancias' && <ConstanciasSeccion constancias={constanciasPersona} />}
    </div>
  )
}

function ResumenSeccion({
  persona,
  constancias,
  movimientos,
  bienestar,
  ultimaMedida,
}: {
  persona: Persona
  constancias: Constancia[]
  movimientos: MovimientoCaja[]
  bienestar: RegistroBienestar[]
  ultimaMedida: MedidaCorporal | null
}) {
  const totalPagado = movimientos
    .filter((movimiento) => movimiento.tipo === 'ingreso')
    .reduce((suma, movimiento) => suma + movimiento.valor, 0)

  const ultimoBienestar = bienestar[0] ?? null

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Metric title="Constancias" value={String(constancias.length)} />
        <Metric title="Pagos" value={String(movimientos.length)} />
        <Metric title="Total pagado" value={`$${totalPagado.toLocaleString()}`} />
        <Metric title="Registros bienestar" value={String(bienestar.length)} />
      </section>

      <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-black">Información</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <InfoItem label="Teléfono" value={persona.telefono || 'Sin teléfono'} />
          <InfoItem label="Correo" value={persona.correo || 'Sin correo'} />
          <InfoItem label="Objetivo" value={persona.objetivo || 'Sin objetivo'} />
          <InfoItem label="Referido por" value={persona.referidoPor || 'Sin referido'} />
        </div>
      </section>

      <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-black">Última medida</h2>

        {ultimaMedida ? (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <InfoItem label="Peso" value={`${ultimaMedida.pesoKg} kg`} />
            <InfoItem label="Estatura" value={`${ultimaMedida.estaturaCm} cm`} />
            <InfoItem label="Fecha" value={ultimaMedida.fecha} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-surface-500">Aún no hay medidas registradas.</p>
        )}
      </section>

      <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-black">Último bienestar</h2>

        {ultimoBienestar ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <InfoItem label="Energía" value={`${ultimoBienestar.energia}/10`} />
            <InfoItem label="Estado de ánimo" value={ultimoBienestar.estadoAnimo} />
            <InfoItem label="Horas de sueño" value={`${ultimoBienestar.horasSueno} h`} />
            <InfoItem label="Vasos de agua" value={`${ultimoBienestar.vasosAgua}`} />
            <InfoItem label="Fecha" value={ultimoBienestar.fecha} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-surface-500">Aún no hay registros de bienestar.</p>
        )}
      </section>

    </div>
  )
}

function MedidasSeccion({
  personaId,
  medidas,
  onCreateMedida,
}: {
  personaId: string
  medidas: MedidaCorporal[]
  onCreateMedida: (medida: MedidaCorporal) => void
}) {
  const [pesoKg, setPesoKg] = useState('')
  const [estaturaCm, setEstaturaCm] = useState('')
  const [cinturaCm, setCinturaCm] = useState('')
  const [pechoCm, setPechoCm] = useState('')
  const [brazoCm, setBrazoCm] = useState('')
  const [piernaCm, setPiernaCm] = useState('')

  function guardarMedida(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!pesoKg || !estaturaCm) {
      alert('Completa al menos peso y estatura.')
      return
    }

    onCreateMedida({
      id: crypto.randomUUID(),
      personaId,
      fecha: new Date().toISOString().slice(0, 10),
      pesoKg: Number(pesoKg),
      estaturaCm: Number(estaturaCm),
      cinturaCm: cinturaCm ? Number(cinturaCm) : undefined,
      pechoCm: pechoCm ? Number(pechoCm) : undefined,
      brazoCm: brazoCm ? Number(brazoCm) : undefined,
      piernaCm: piernaCm ? Number(piernaCm) : undefined,
    })

    setPesoKg('')
    setEstaturaCm('')
    setCinturaCm('')
    setPechoCm('')
    setBrazoCm('')
    setPiernaCm('')
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-black">Registrar medida</h2>

        <form onSubmit={guardarMedida} className="mt-4 grid gap-4 sm:grid-cols-3">
          <Input label="Peso (kg)" value={pesoKg} onChange={setPesoKg} type="number" />
          <Input label="Estatura (cm)" value={estaturaCm} onChange={setEstaturaCm} type="number" />
          <Input label="Cintura (cm)" value={cinturaCm} onChange={setCinturaCm} type="number" />
          <Input label="Pecho (cm)" value={pechoCm} onChange={setPechoCm} type="number" />
          <Input label="Brazo (cm)" value={brazoCm} onChange={setBrazoCm} type="number" />
          <Input label="Pierna (cm)" value={piernaCm} onChange={setPiernaCm} type="number" />

          <button
            type="submit"
            className="rounded-2xl bg-brand-600 px-5 py-3 font-black text-white transition hover:bg-brand-700 sm:col-span-3"
          >
            Guardar medida
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-black">Historial de medidas</h2>

        {medidas.length === 0 ? (
          <p className="mt-3 text-sm text-surface-500">Aún no hay medidas registradas.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {medidas.map((medida) => (
              <div
                key={medida.id}
                className="flex items-center justify-between rounded-2xl border border-surface-100 p-4"
              >
                <div>
                  <p className="font-black">{medida.fecha}</p>
                  <p className="text-xs text-surface-500">
                    Peso {medida.pesoKg} kg · Estatura {medida.estaturaCm} cm
                    {medida.cinturaCm ? ` · Cintura ${medida.cinturaCm} cm` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}

function PagosSeccion({ movimientos }: { movimientos: MovimientoCaja[] }) {
  const totalIngresos = movimientos
    .filter((movimiento) => movimiento.tipo === 'ingreso')
    .reduce((suma, movimiento) => suma + movimiento.valor, 0)

  const totalEgresos = movimientos
    .filter((movimiento) => movimiento.tipo === 'gasto')
    .reduce((suma, movimiento) => suma + movimiento.valor, 0)

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <Metric title="Ingresos" value={`$${totalIngresos.toLocaleString()}`} />
        <Metric title="Egresos" value={`$${totalEgresos.toLocaleString()}`} />
        <Metric title="Saldo" value={`$${(totalIngresos - totalEgresos).toLocaleString()}`} />
      </section>

      <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-black">Movimientos</h2>

        {movimientos.length === 0 ? (
          <p className="mt-3 text-sm text-surface-500">Aún no hay movimientos registrados.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {movimientos.map((movimiento) => (
              <div
                key={movimiento.id}
                className="flex items-center justify-between rounded-2xl border border-surface-100 p-4"
              >
                <div>
                  <p className="font-black">{movimiento.concepto}</p>
                  <p className="text-xs text-surface-500">{movimiento.fecha}</p>
                </div>

                <span
                  className={`font-black ${
                    movimiento.tipo === 'ingreso' ? 'text-success-600' : 'text-danger-600'
                  }`}
                >
                  {movimiento.tipo === 'ingreso' ? '+' : '-'}$
                  {movimiento.valor.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}

function BienestarSeccion({ registros }: { registros: RegistroBienestar[] }) {
  return (
    <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-2xl font-black">Registros de bienestar</h2>

      {registros.length === 0 ? (
        <p className="mt-3 text-sm text-surface-500">Aún no hay registros de bienestar.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {registros.map((registro) => (
            <div
              key={registro.id}
              className="flex items-center justify-between rounded-2xl border border-surface-100 p-4"
            >
              <div>
                <p className="font-black">{registro.fecha}</p>
                <p className="text-xs text-surface-500">
                  Energía {registro.energia}/10 · Sueño {registro.horasSueno}h · Agua{' '}
                  {registro.vasosAgua}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function PlanSeccion({ plan }: { plan: PlanEntrenamiento | null }) {
  if (!plan) {
    return (
      <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-black">Plan de entrenamiento</h2>
        <p className="mt-3 text-sm text-surface-500">
          Esta persona aún no tiene un plan de entrenamiento asignado.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-2xl font-black">Plan de entrenamiento</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <InfoItem label="Nombre" value={plan.nombre} />
        <InfoItem label="Días por semana" value={String(plan.diasSemana)} />
        <InfoItem label="Estado" value={plan.estado} />
        <InfoItem label="Objetivo" value={plan.objetivo} />
      </div>

      <p className="mt-4 text-sm leading-6 text-surface-600">{plan.descripcion}</p>
    </section>
  )
}

function ConstanciasSeccion({ constancias }: { constancias: Constancia[] }) {
  return (
    <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-2xl font-black">Constancias</h2>

      {constancias.length === 0 ? (
        <p className="mt-3 text-sm text-surface-500">Aún no hay constancias registradas.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {constancias.map((constancia) => (
            <div
              key={constancia.id}
              className="flex items-center justify-between rounded-2xl border border-surface-100 p-4"
            >
              <div>
                <p className="font-black">{constancia.fecha}</p>
                <p className="text-xs text-surface-500">Marcada por {constancia.registradoPor}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-surface-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-surface-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-surface-900">{value}</p>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-surface-400">{label}</p>
      <p className="mt-1 font-black text-surface-900">{value}</p>
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
      <span className="text-sm font-bold text-surface-700">{label}</span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-2xl border border-surface-200 px-4 py-3 outline-none transition focus:border-brand-600"
      />
    </label>
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
    activa: 'bg-success-50 text-success-700',
    en_pausa: 'bg-warning-50 text-warning-700',
    registro: 'bg-info-50 text-info-700',
    historica: 'bg-surface-100 text-surface-700',
  }

  return classes[estado]
}


