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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-slate-950 p-8 text-white md:p-12">
          <p className="text-sm font-bold text-slate-300">ORIGEN</p>

          <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight md:text-5xl">
            Cada persona importa. Cada hábito cuenta.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300">
            Ingresa a tu plataforma de bienestar, constancia, entrenamiento,
            caja, tienda y seguimiento de personas.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Card title="Admin" text="Gestión completa" />
            <Card title="Entrenador" text="Acompañamiento" />
            <Card title="Persona" text="Progreso personal" />
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div>
            <p className="text-sm font-bold text-slate-500">Acceso seguro</p>

            <h2 className="mt-2 text-3xl font-black text-slate-950">
              Iniciar sesión
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Usa tu correo y contraseña de Supabase Auth. Si el usuario no existe o la contraseña es incorrecta, verás el error correspondiente.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="correo"
                className="text-sm font-black text-slate-700"
              >
                Correo
              </label>

              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-950"
                placeholder="correo@ejemplo.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-black text-slate-700"
              >
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-950"
                placeholder="Tu contraseña"
                autoComplete="current-password"
              />
            </div>

            {errorMessage && (
              <div className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl px-5 py-4 text-sm font-black text-white ${
                loading
                  ? 'cursor-not-allowed bg-slate-400'
                  : 'bg-slate-950 hover:bg-slate-800'
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
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="font-black text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-300">{text}</p>
    </div>
  )
}