import { useState, type FormEvent } from 'react'
import type { ConfiguracionGimnasio } from '@/shared/types/configuracion'

interface Props {
  configuracion: ConfiguracionGimnasio
  onUpdateConfiguracion: (configuracion: ConfiguracionGimnasio) => void
}

const tonos = ['Cercano', 'Profesional', 'Motivador', 'Juvenil', 'Premium']
const terminosPersonas = ['Personas', 'Miembros', 'Afiliados', 'Clientes', 'Usuarios']

export function ConfiguracionPage({ configuracion, onUpdateConfiguracion }: Props) {
  const [form, setForm] = useState<ConfiguracionGimnasio>(configuracion)

  function guardarConfiguracion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.nombre.trim()) {
      alert('El nombre del gimnasio es obligatorio.')
      return
    }

    onUpdateConfiguracion({
      nombre: form.nombre.trim(),
      lema: form.lema.trim(),
      telefono: form.telefono.trim(),
      direccion: form.direccion.trim(),
      terminoPersonas: form.terminoPersonas,
      tono: form.tono,
    })

    alert('Configuración guardada correctamente.')
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-slate-950 p-8 text-white">
        <p className="text-sm text-slate-300">Configuración</p>
        <h1 className="mt-3 text-4xl font-black">Personaliza ORIGEN</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Define cómo se verá y cómo hablará el sistema dentro del gimnasio.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Datos del gimnasio</h2>
          <p className="mt-1 text-sm text-slate-500">
            Esta información se usa en el panel administrativo y luego podrá aparecer en reportes,
            mensajes, recibos y portal de personas.
          </p>

          <form onSubmit={guardarConfiguracion} className="mt-6 grid gap-4">
            <Input
              label="Nombre del gimnasio"
              value={form.nombre}
              onChange={(value) => setForm({ ...form, nombre: value })}
            />

            <Input
              label="Lema"
              value={form.lema}
              onChange={(value) => setForm({ ...form, lema: value })}
            />

            <Input
              label="Teléfono"
              value={form.telefono}
              onChange={(value) => setForm({ ...form, telefono: value })}
            />

            <Input
              label="Dirección"
              value={form.direccion}
              onChange={(value) => setForm({ ...form, direccion: value })}
            />

            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                ¿Cómo llamar a las personas?
              </span>
              <select
                value={form.terminoPersonas}
                onChange={(event) =>
                  setForm({ ...form, terminoPersonas: event.target.value })
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              >
                {terminosPersonas.map((termino) => (
                  <option key={termino} value={termino}>
                    {termino}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Tono de comunicación</span>
              <select
                value={form.tono}
                onChange={(event) => setForm({ ...form, tono: event.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              >
                {tonos.map((tono) => (
                  <option key={tono} value={tono}>
                    {tono}
                  </option>
                ))}
              </select>
            </label>

            <button className="mt-2 rounded-2xl bg-slate-950 px-5 py-3 font-black text-white hover:bg-slate-800">
              Guardar configuración
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Vista previa</h2>

            <div className="mt-5 rounded-[2rem] bg-slate-950 p-6 text-white">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-slate-950">
                {form.nombre.trim().charAt(0).toUpperCase() || 'O'}
              </div>

              <h3 className="mt-4 text-2xl font-black">
                {form.nombre || 'Nombre del gimnasio'}
              </h3>

              <p className="mt-2 text-sm text-slate-300">
                {form.lema || 'Lema del gimnasio'}
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Lenguaje ORIGEN</h2>

            <div className="mt-5 space-y-3">
              <Line label="Término principal" value={form.terminoPersonas} />
              <Line label="Tono" value={form.tono} />
              <Line label="Teléfono" value={form.telefono || 'Sin teléfono'} />
              <Line label="Dirección" value={form.direccion || 'Sin dirección'} />
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Mensaje ejemplo</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Bienvenido a {form.nombre || 'ORIGEN'}. Aquí cada{' '}
              {form.terminoPersonas.toLowerCase()} importa, cada hábito cuenta y cada logro merece
              ser celebrado.
            </p>
          </section>
        </aside>
      </section>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
      />
    </label>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <span className="text-right text-sm font-black">{value}</span>
    </div>
  )
}