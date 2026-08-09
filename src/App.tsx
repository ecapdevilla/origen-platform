import { useEffect, useState } from 'react'
import { AdminLayout } from '@/app/layouts/AdminLayout'
import {
  cerrarSesionSupabase,
  obtenerSesionActualSupabase,
} from '@/features/auth/authApi'
import { LoginPage } from '@/features/auth/LoginPage'
import { EntrenadorPortalPage } from '@/features/entrenador/EntrenadorPortalPage'
import { PersonaPortalPage } from '@/features/portal-persona/PersonaPortalPage'
import type { SesionUsuario } from '@/shared/types/auth'

export default function App() {
  const [usuario, setUsuario] = useState<SesionUsuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function validarSesion() {
      try {
        const sesionActual = await obtenerSesionActualSupabase()

        if (mounted) {
          setUsuario(sesionActual)
        }
      } catch (error) {
        console.error('Error validando sesión:', error)

        if (mounted) {
          setUsuario(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    validarSesion()

    return () => {
      mounted = false
    }
  }, [])

  async function cerrarSesion() {
    try {
      await cerrarSesionSupabase()
    } catch (error) {
      console.error('Error cerrando sesión:', error)
    } finally {
      setUsuario(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-100 p-6">
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-surface-500">ORIGEN</p>

          <h1 className="mt-2 text-2xl font-black text-surface-950">
            Validando sesión
          </h1>

          <p className="mt-3 text-sm text-surface-500">
            Estamos verificando tu acceso seguro.
          </p>
        </div>
      </div>

    )
  }

  if (!usuario) {
    return <LoginPage onLogin={setUsuario} />
  }

  if (usuario.rol === 'admin') {
    return <AdminLayout usuario={usuario} onLogout={cerrarSesion} />
  }

  if (usuario.rol === 'entrenador') {
    return <EntrenadorPortalPage usuario={usuario} onLogout={cerrarSesion} />
  }

  return <PersonaPortalPage usuario={usuario} onLogout={cerrarSesion} />
}