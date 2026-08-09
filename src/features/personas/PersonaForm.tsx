import { useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import type { EstadoPersona, Persona } from '@/shared/types/persona'

interface Props {
  personas: Persona[]
  editandoId: string | null
  onCreatePersona: (persona: Persona) => void
  onUpdatePersona: (persona: Persona) => void
  onVolver: () => void
  onGuardada: (persona: Persona) => void
}

interface PersonaFormState {
  nombres: string
  apellidos: string
  documento: string
  telefono: string
  correo: string
  objetivo: string
  estado: EstadoPersona
  referidoPor: string
}

const estadoOptions: EstadoPersona[] = ['activa', 'en_pausa', 'registro', 'historica']

const initialForm: PersonaFormState = {
  nombres: '',
  apellidos: '',
  documento: '',
  telefono: '',
  correo: '',
  objetivo: '',
  estado: 'registro',
  referidoPor: '',
}

export function PersonaForm({
  personas,
  editandoId,
  onCreatePersona,
  onUpdatePersona,
  onVolver,
  onGuardada,
}: Props) {
  const personaEditando = useMemo(
    () => personas.find((persona) => persona.id === editandoId) ?? null,
    [personas, editandoId],
  )

  const [form, setForm] = useState<PersonaFormState>(() =>
    personaEditando
      ? {
          nombres: personaEditando.nombres,
          apellidos: personaEditando.apellidos,
          documento: personaEditando.documento,
          telefono: personaEditando.telefono,
          correo: personaEditando.correo,
          objetivo: personaEditando.objetivo,
          estado: personaEditando.estado,
          referidoPor: personaEditando.referidoPor ?? '',
        }
      : initialForm,
  )

  function guardarPersona(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.nombres.trim()) {
      alert('El nombre es obligatorio.')
      return
    }

    if (!form.apellidos.trim()) {
      alert('El apellido es obligatorio.')
      return
    }

    if (!form.documento.trim()) {
      alert('El documento es obligatorio.')
      return
    }

    const personaBase = {
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      documento: form.documento.trim(),
      telefono: form.telefono.trim(),
      correo: form.correo.trim(),
      objetivo: form.objetivo.trim(),
      estado: form.estado,
      referidoPor: form.referidoPor.trim(),
    }

    if (personaEditando) {
      const personaActualizada: Persona = {
        ...personaEditando,
        ...personaBase,
      }

      onUpdatePersona(personaActualizada)
      onGuardada(personaActualizada)
      return
    }

    const nuevaPersona: Persona = {
      id: crypto.randomUUID(),
      ...personaBase,
      fechaRegistro: new Date().toISOString().slice(0, 10),
    }

    onCreatePersona(nuevaPersona)
    onGuardada(nuevaPersona)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-800 bg-slate-950 p-6 text-white shadow-[0_20px_70px_-25px_rgba(15,23,42,0.35)] sm:p-8">
        <button
          type="button"
          onClick={onVolver}
          className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/20"
        >
          <ArrowLeft size={16} />
          Volver al listado
        </button>

        <h1 className="mt-5 text-3xl font-black sm:text-4xl">
          {personaEditando ? 'Editar persona' : 'Registrar persona'}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
          {personaEditando
            ? 'Actualiza la información principal de la persona.'
            : 'Ingresa la información principal de la nueva persona.'}
        </p>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <form onSubmit={guardarPersona} className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nombres"
            value={form.nombres}
            onChange={(value) => setForm({ ...form, nombres: value })}
            placeholder="Ej: Edwin"
          />

          <Input
            label="Apellidos"
            value={form.apellidos}
            onChange={(value) => setForm({ ...form, apellidos: value })}
            placeholder="Ej: Capdevilla"
          />

          <Input
            label="Documento"
            value={form.documento}
            onChange={(value) => setForm({ ...form, documento: value })}
            placeholder="Número de identificación"
          />

          <Input
            label="Teléfono"
            value={form.telefono}
            onChange={(value) => setForm({ ...form, telefono: value })}
            placeholder="Ej: 3000000000"
          />

          <Input
            label="Correo"
            type="email"
            value={form.correo}
            onChange={(value) => setForm({ ...form, correo: value })}
            placeholder="persona@correo.com"
          />

          <Input
            label="Objetivo"
            value={form.objetivo}
            onChange={(value) => setForm({ ...form, objetivo: value })}
            placeholder="Ej: Aumentar masa muscular"
          />

          <Input
            label="Referido por"
            value={form.referidoPor}
            onChange={(value) => setForm({ ...form, referidoPor: value })}
            placeholder="Nombre de quien la refirió (opcional)"
          />

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Estado</span>

            <select
              value={form.estado}
              onChange={(event) =>
                setForm({ ...form, estado: event.target.value as EstadoPersona })
              }
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
            >
              {estadoOptions.map((estado) => (
                <option key={estado} value={estado}>
                  {estadoLabel(estado)}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-black text-white transition hover:bg-slate-800"
            >
              <Save size={18} />
              {personaEditando ? 'Guardar cambios' : 'Crear persona'}
            </button>

            <button
              type="button"
              onClick={onVolver}
              className="rounded-2xl border border-slate-200 px-5 py-3 font-black text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </form>
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

function estadoLabel(estado: EstadoPersona) {
  const labels: Record<EstadoPersona, string> = {
    activa: 'Activa',
    en_pausa: 'En pausa',
    registro: 'En registro',
    historica: 'Histórica',
  }

  return labels[estado]
}
