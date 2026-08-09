import { useState } from 'react'
import { loginSupabase, obtenerUsuarioDemo } from '@/features/auth/authApi'
import type { SesionUsuario } from '@/shared/types/auth'

interface Props {
  onLogin: (usuario: SesionUsuario) => void
}

export function LoginPage({ onLogin }: Props) {
  const [correo, setCorreo] = useState('estiben.capdevilla@gmail.com')
  const [password, setPassword] = useState('Sistemas2026')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!correo.trim()) {
      setErrorMessage('Ingresa tu correo.')
      return
    }

    const correoNormalizado = correo.trim().toLowerCase()
    const usuarioDemo = obtenerUsuarioDemo(correoNormalizado)

    if (usuarioDemo) {
      setLoading(true)
      setErrorMessage('')
      onLogin(usuarioDemo)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setErrorMessage('')

      const usuario = await loginSupabase(correoNormalizado, password)
      onLogin(usuario)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar sesión en ORIGEN.'

      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_var(--color-surface-50)_0%,_var(--color-surface-200)_100%)] p-3 sm:p-6">
      <section className="grid w-full max-w-6xl overflow-hidden rounded-[1.5rem] border border-surface-200 bg-white shadow-[0_20px_60px_-20px_rgba(28,25,23,0.35)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="bg-surface-950 p-6 text-white sm:p-8 lg:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-surface-300">ORIGEN</p>

          <h1 className="mt-6 max-w-xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Cada persona importa. Cada hábito cuenta.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-surface-300 sm:text-base">

            Ingresa a tu plataforma de bienestar, constancia, entrenamiento,
            caja, tienda y seguimiento de personas.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Card title="Admin" text="Gestión completa" />
            <Card title="Entrenador" text="Acompañamiento" />
            <Card title="Persona" text="Progreso personal" />
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div>
            <p className="text-sm font-bold text-surface-500">Acceso seguro</p>

            <h2 className="mt-2 text-2xl font-black text-surface-950 sm:text-3xl">
              Iniciar sesión
            </h2>

            <p className="mt-3 text-sm leading-6 text-surface-500">
              Usa tu correo y contraseña de Supabase Auth. Si el usuario no existe o la contraseña es incorrecta, verás el error correspondiente.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="correo"
                className="text-sm font-black text-surface-700"
              >
                Correo
              </label>

              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-surface-950 focus:ring-2 focus:ring-surface-200"
                placeholder="correo@ejemplo.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-black text-surface-700"
              >
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-surface-950 focus:ring-2 focus:ring-surface-200"
                placeholder="Tu contraseña"
                autoComplete="current-password"
              />
            </div>

            {errorMessage && (
              <div className="rounded-2xl bg-danger-50 p-4 text-sm font-bold text-danger-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl px-5 py-3.5 text-sm font-black text-white transition ${
                loading
                  ? 'cursor-not-allowed bg-surface-400'
                  : 'bg-surface-950 hover:bg-surface-800'
              }`}
            >
              {loading ? 'Ingresando...' : 'Entrar a ORIGEN'}
            </button>
          </form>

        </div>
      </section>
    </div>
  )
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
      <p className="font-black text-white">{title}</p>
      <p className="mt-1 text-xs leading-5 text-surface-300 sm:text-sm">{text}</p>

    </div>
  )
}