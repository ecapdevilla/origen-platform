import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import type { RolUsuario } from '@/shared/types/auth'
import type { Persona } from '@/shared/types/persona'
import type {
  CrearUsuarioSistemaInput,
  UsuarioSistema,
} from '@/shared/types/usuario'

interface Props {
  usuarios: UsuarioSistema[]
  personas: Persona[]
  onCreateUsuario: (usuario: CrearUsuarioSistemaInput) => void | Promise<void>
  onUpdateUsuario: (usuario: UsuarioSistema) => void | Promise<void>
  onChangeEstado: (usuarioId: string, activo: boolean) => void | Promise<void>
}

const emptyForm: CrearUsuarioSistemaInput = {
  nombres: '',
  apellidos: '',
  correo: '',
  rol: 'entrenador',
  activo: true,
  authUserId: '',
  personaId: '',
}

export function UsuariosPage({
  usuarios,
  personas,
  onCreateUsuario,
  onUpdateUsuario,
  onChangeEstado,
}: Props) {
  const [form, setForm] = useState<CrearUsuarioSistemaInput>({ ...emptyForm })
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(false)

  const personasPorId = useMemo(() => {
    return new Map(personas.map((persona) => [persona.id, persona]))
  }, [personas])

  const usuarioEditando = useMemo(() => {
    return usuarios.find((usuario) => usuario.id === usuarioEditandoId)
  }, [usuarios, usuarioEditandoId])

  const usuariosFiltrados = useMemo(() => {
    const text = busqueda.trim().toLowerCase()

    if (!text) return usuarios

    return usuarios.filter((usuario) => {
      const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`.toLowerCase()
      const personaRelacionada = usuario.personaId
        ? personasPorId.get(usuario.personaId)
        : undefined

      const nombrePersona = personaRelacionada
        ? `${personaRelacionada.nombres} ${personaRelacionada.apellidos}`.toLowerCase()
        : ''

      return (
        nombreCompleto.includes(text) ||
        usuario.correo.toLowerCase().includes(text) ||
        usuario.rol.toLowerCase().includes(text) ||
        nombrePersona.includes(text)
      )
    })
  }, [usuarios, busqueda, personasPorId])

  const totalAdmin = usuarios.filter((usuario) => usuario.rol === 'admin').length
  const totalEntrenador = usuarios.filter(
    (usuario) => usuario.rol === 'entrenador',
  ).length
  const totalPersona = usuarios.filter((usuario) => usuario.rol === 'persona').length
  const totalActivos = usuarios.filter((usuario) => usuario.activo).length

  function updateForm<K extends keyof CrearUsuarioSistemaInput>(
    key: K,
    value: CrearUsuarioSistemaInput[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function seleccionarPersona(personaId: string) {
    const persona = personasPorId.get(personaId)

    setForm((current) => {
      if (!persona) {
        return {
          ...current,
          personaId: '',
        }
      }

      return {
        ...current,
        personaId,
        nombres: persona.nombres,
        apellidos: persona.apellidos,
        correo: persona.correo || current.correo,
      }
    })
  }

  function limpiarFormulario() {
    setForm({ ...emptyForm })
    setUsuarioEditandoId(null)
  }

  function seleccionarEditar(usuario: UsuarioSistema) {
    setUsuarioEditandoId(usuario.id)

    setForm({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      rol: usuario.rol,
      activo: usuario.activo,
      authUserId: usuario.authUserId || '',
      personaId: usuario.personaId || '',
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.nombres.trim()) {
      alert('Ingresa los nombres del usuario.')
      return
    }

    if (!form.apellidos.trim()) {
      alert('Ingresa los apellidos del usuario.')
      return
    }

    if (!form.correo.trim()) {
      alert('Ingresa el correo del usuario.')
      return
    }

    if (form.rol === 'persona' && !form.personaId) {
      alert('Un usuario con rol Persona debe estar enlazado a una persona.')
      return
    }

    try {
      setLoading(true)

      if (usuarioEditando) {
        await onUpdateUsuario({
          ...usuarioEditando,
          nombres: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          correo: form.correo.trim().toLowerCase(),
          rol: form.rol,
          activo: form.activo,
          authUserId: form.authUserId?.trim() || null,
          personaId: form.personaId?.trim() || null,
        })
      } else {
        await onCreateUsuario({
          nombres: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          correo: form.correo.trim().toLowerCase(),
          rol: form.rol,
          activo: form.activo,
          authUserId: form.authUserId?.trim() || null,
          personaId: form.personaId?.trim() || null,
        })
      }

      limpiarFormulario()
    } catch (error) {
      console.error('Error guardando usuario:', error)
      alert('No se pudo guardar el usuario.')
    } finally {
      setLoading(false)
    }
  }

  async function cambiarEstado(usuario: UsuarioSistema) {
    const nuevoEstado = !usuario.activo

    try {
      setLoading(true)
      await onChangeEstado(usuario.id, nuevoEstado)
    } catch (error) {
      console.error('Error cambiando estado del usuario:', error)
      alert('No se pudo cambiar el estado del usuario.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-surface-800 bg-surface-950 p-6 text-white shadow-[0_20px_70px_-25px_rgba(28,25,23,0.35)] sm:p-8">
        <p className="text-sm text-surface-300">Seguridad y acceso</p>

        <h1 className="mt-3 text-4xl font-black">Usuarios y Roles</h1>

        <p className="mt-4 max-w-3xl text-surface-300">

          Administra usuarios internos, roles, acceso con Supabase Auth y enlace
          directo con una persona del gimnasio.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <Metric title="Usuarios" value={String(usuarios.length)} />
        <Metric title="Activos" value={String(totalActivos)} />
        <Metric title="Admins" value={String(totalAdmin)} />
        <Metric title="Entrenadores" value={String(totalEntrenador)} />
        <Metric title="Personas" value={String(totalPersona)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div>
            <h2 className="text-2xl font-black text-surface-950">
              {usuarioEditando ? 'Editar usuario' : 'Nuevo usuario'}
            </h2>

            <p className="mt-1 text-sm text-surface-500">
              Registra el perfil interno, su rol y su persona enlazada.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <Field label="Persona enlazada">
              <select
                value={form.personaId || ''}
                onChange={(event) => seleccionarPersona(event.target.value)}
                className="w-full rounded-2xl border border-surface-200 bg-white px-4 py-3 outline-none focus:border-surface-950"
              >
                <option value="">Sin persona enlazada</option>

                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.nombres} {persona.apellidos} · {persona.documento}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs leading-5 text-surface-500">
                Para rol Persona, este campo es obligatorio. Así el portal solo
                mostrará la información de esa persona.
              </p>
            </Field>

            <Field label="Nombres">
              <input
                value={form.nombres}
                onChange={(event) => updateForm('nombres', event.target.value)}
                className="w-full rounded-2xl border border-surface-200 px-4 py-3 outline-none focus:border-surface-950"
                placeholder="Ej: Edwin"
              />
            </Field>

            <Field label="Apellidos">
              <input
                value={form.apellidos}
                onChange={(event) => updateForm('apellidos', event.target.value)}
                className="w-full rounded-2xl border border-surface-200 px-4 py-3 outline-none focus:border-surface-950"
                placeholder="Ej: Capdevilla"
              />
            </Field>

            <Field label="Correo">
              <input
                type="email"
                value={form.correo}
                onChange={(event) => updateForm('correo', event.target.value)}
                className="w-full rounded-2xl border border-surface-200 px-4 py-3 outline-none focus:border-surface-950"
                placeholder="usuario@correo.com"
              />
            </Field>

            <Field label="Rol">
              <select
                value={form.rol}
                onChange={(event) =>
                  updateForm('rol', event.target.value as RolUsuario)
                }
                className="w-full rounded-2xl border border-surface-200 bg-white px-4 py-3 outline-none focus:border-surface-950"
              >
                <option value="admin">Admin</option>
                <option value="entrenador">Entrenador</option>
                <option value="persona">Persona</option>
              </select>
            </Field>

            <Field label="Auth User ID">
              <input
                value={form.authUserId || ''}
                onChange={(event) => updateForm('authUserId', event.target.value)}
                className="w-full rounded-2xl border border-surface-200 px-4 py-3 outline-none focus:border-surface-950"
                placeholder="UUID de Supabase Auth"
              />

              <p className="mt-2 text-xs leading-5 text-surface-500">
                Este campo se copia desde Supabase Authentication. Si lo dejas vacío,
                el usuario queda creado en ORIGEN pero sin acceso al login.
              </p>
            </Field>

            <label className="flex items-center gap-3 rounded-2xl bg-surface-50 p-4">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(event) => updateForm('activo', event.target.checked)}
                className="h-5 w-5"
              />

              <span className="text-sm font-black text-surface-700">
                Usuario activo
              </span>
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 rounded-2xl px-5 py-3 text-sm font-black text-white ${
                loading
                  ? 'cursor-not-allowed bg-surface-400'
                  : 'bg-surface-950 hover:bg-surface-800'
              }`}
            >
              {loading
                ? 'Guardando...'
                : usuarioEditando
                  ? 'Guardar cambios'
                  : 'Crear usuario'}
            </button>

            {usuarioEditando && (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="rounded-2xl bg-surface-100 px-5 py-3 text-sm font-black text-surface-700 hover:bg-surface-200"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>


        <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-surface-950">
                Usuarios registrados
              </h2>

              <p className="mt-1 text-sm text-surface-500">
                Lista de usuarios, roles, estado, Auth y persona enlazada.
              </p>
            </div>

            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              className="rounded-2xl border border-surface-200 px-4 py-3 outline-none focus:border-surface-950"
              placeholder="Buscar usuario..."
            />
          </div>

          <div className="mt-6 space-y-3">
            {usuariosFiltrados.map((usuario) => {
              const personaRelacionada = usuario.personaId
                ? personasPorId.get(usuario.personaId)
                : undefined

              return (
                <article
                  key={usuario.id}
                  className="rounded-[1.5rem] border border-surface-100 bg-surface-50 p-5"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-surface-950">
                          {usuario.nombres} {usuario.apellidos}
                        </h3>

                        <Badge label={usuario.rol} />
                        <Badge label={usuario.activo ? 'Activo' : 'Inactivo'} />
                        <Badge
                          label={usuario.authUserId ? 'Auth enlazado' : 'Sin Auth'}
                        />
                        <Badge
                          label={
                            personaRelacionada
                              ? 'Persona enlazada'
                              : 'Sin persona'
                          }
                        />
                      </div>

                      <p className="mt-2 text-sm text-surface-500">
                        {usuario.correo}
                      </p>

                      {personaRelacionada && (
                        <p className="mt-2 text-sm font-bold text-surface-700">
                          Persona: {personaRelacionada.nombres}{' '}
                          {personaRelacionada.apellidos}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-surface-400">
                        Creado: {formatDate(usuario.fechaCreacion)}
                      </p>

                      {usuario.authUserId && (
                        <p className="mt-2 break-all text-xs text-surface-400">
                          Auth ID: {usuario.authUserId}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => seleccionarEditar(usuario)}
                        className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-surface-700 shadow-sm hover:bg-surface-100"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => cambiarEstado(usuario)}
                        className={`rounded-2xl px-4 py-3 text-sm font-black ${
                          usuario.activo
                            ? 'bg-danger-50 text-danger-700 hover:bg-danger-100'
                            : 'bg-success-50 text-success-700 hover:bg-success-100'
                        }`}
                      >
                        {usuario.activo ? 'Inactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}

            {usuariosFiltrados.length === 0 && (
              <div className="rounded-2xl border border-dashed border-surface-300 p-8 text-center">
                <p className="font-black text-surface-700">
                  No se encontraron usuarios.
                </p>

                <p className="mt-2 text-sm text-surface-500">
                  Prueba con otro nombre, correo, rol o persona enlazada.
                </p>
              </div>
            )}
          </div>
        </section>

      </section>

      <section className="rounded-[2rem] bg-warning-50 p-6">
        <h2 className="text-xl font-black text-warning-900">
          Flujo recomendado para crear acceso real
        </h2>


        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Step
            number="1"
            title="Crear en Auth"
            text="En Supabase Authentication crea el usuario con correo y contraseña."
          />

          <Step
            number="2"
            title="Copiar Auth ID"
            text="Copia el UUID del usuario creado en Authentication."
          />

          <Step
            number="3"
            title="Enlazar en ORIGEN"
            text="Registra o edita el usuario aquí, pega el Auth User ID y selecciona la persona enlazada si aplica."
          />
        </div>
      </section>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-surface-700">{label}</span>

      <div className="mt-2">{children}</div>
    </label>
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

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-surface-700 shadow-sm">
      {label}
    </span>
  )
}

function Step({
  number,
  title,
  text,
}: {
  number: string
  title: string
  text: string
}) {
  return (
    <div className="rounded-2xl bg-white p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-950 text-sm font-black text-white">
        {number}
      </div>

      <h3 className="mt-4 font-black text-surface-950">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-surface-500">{text}</p>
    </div>
  )
}


function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}