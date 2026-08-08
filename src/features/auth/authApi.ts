import { supabase } from '@/shared/lib/supabase'
import type { SesionUsuario } from '@/shared/types/auth'

interface UsuarioOrigenRow {
  id: string
  nombres: string
  apellidos: string
  correo: string
  rol: SesionUsuario['rol']
  activo: boolean
  persona_id: string | null
}

function mapUsuarioOrigen(row: UsuarioOrigenRow): SesionUsuario {
  return {
    id: row.id,
    nombre: `${row.nombres} ${row.apellidos}`.trim(),
    correo: row.correo,
    rol: row.rol,
    personaId: row.persona_id,
  }
}

function isDemoModeEnabled(): boolean {
  return import.meta.env.DEV || import.meta.env.MODE === 'test'
}

export function obtenerUsuarioDemo(correo: string): SesionUsuario | null {
  if (!isDemoModeEnabled()) {
    return null
  }

  const correoNormalizado = correo.trim().toLowerCase()
  const usuariosDemo: Record<string, Omit<SesionUsuario, 'correo'>> = {
    'admin@origen.test': {
      id: 'demo-admin',
      nombre: 'Usuario demo admin',
      rol: 'admin',
      personaId: null,
    },
    'estiben.capdevilla@gmail.com': {
      id: 'demo-estiben',
      nombre: 'Estiben Capdevilla',
      rol: 'admin',
      personaId: null,
    },
  }

  const datosDemo = usuariosDemo[correoNormalizado]

  if (!datosDemo) {
    return null
  }

  return {
    ...datosDemo,
    correo: correoNormalizado,
  }
}

async function obtenerUsuarioOrigen(
  authUserId: string,
  correo: string,
): Promise<SesionUsuario | null> {
  const correoNormalizado = correo.trim().toLowerCase()

  const { data: usuarioPorAuthId, error: errorPorAuthId } = await supabase
    .from('usuarios')
    .select('id, nombres, apellidos, correo, rol, activo, persona_id, auth_user_id')
    .eq('auth_user_id', authUserId)
    .eq('activo', true)
    .maybeSingle()

  if (errorPorAuthId) {
    throw new Error(
      `No se pudo leer usuarios por auth_user_id. Código: ${
        errorPorAuthId.code || 'sin código'
      }. Mensaje: ${errorPorAuthId.message}`,
    )
  }

  if (usuarioPorAuthId) {
    return mapUsuarioOrigen(usuarioPorAuthId as UsuarioOrigenRow)
  }

  const { data: usuarioPorCorreo, error: errorPorCorreo } = await supabase
    .from('usuarios')
    .select('id, nombres, apellidos, correo, rol, activo, persona_id, auth_user_id')
    .ilike('correo', correoNormalizado)
    .eq('activo', true)
    .maybeSingle()

  if (errorPorCorreo) {
    throw new Error(
      `No se pudo leer usuarios por correo. Código: ${
        errorPorCorreo.code || 'sin código'
      }. Mensaje: ${errorPorCorreo.message}`,
    )
  }

  if (usuarioPorCorreo) {
    const { error: errorActualizacion } = await supabase
      .from('usuarios')
      .update({ auth_user_id: authUserId })
      .eq('id', usuarioPorCorreo.id)

    if (errorActualizacion) {
      console.warn('No se pudo actualizar auth_user_id del usuario:', errorActualizacion)
    }

    return mapUsuarioOrigen(usuarioPorCorreo as UsuarioOrigenRow)
  }

  return null
}

export async function loginSupabase(
  correo: string,
  password: string,
): Promise<SesionUsuario> {
  const correoNormalizado = correo.trim().toLowerCase()
  const usuarioDemo = obtenerUsuarioDemo(correoNormalizado)

  if (usuarioDemo && (!password || !password.trim())) {
    return usuarioDemo
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: correoNormalizado,
      password,
    })

    if (authError) {
      if (usuarioDemo) {
        console.warn('Fallo el login real; usando sesión demo en modo desarrollo:', authError.message)
        return usuarioDemo
      }

      throw new Error(authError.message)
    }

    if (!authData.user || !authData.user.email) {
      throw new Error('No se pudo obtener el usuario autenticado.')
    }

    const usuarioOrigen = await obtenerUsuarioOrigen(
      authData.user.id,
      authData.user.email,
    )

    if (!usuarioOrigen) {
      await supabase.auth.signOut()

      throw new Error(
        `El usuario autenticó correctamente, pero no existe activo en public.usuarios para el correo ${correoNormalizado}. Auth ID: ${authData.user.id}`,
      )
    }

    return usuarioOrigen
  } catch (error) {
    if (usuarioDemo) {
      console.warn('Fallo el login real; usando sesión demo en modo desarrollo:', error)
      return usuarioDemo
    }

    throw error
  }
}

export async function obtenerSesionActualSupabase(): Promise<SesionUsuario | null> {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  const authUser = data.session?.user

  if (!authUser || !authUser.email) {
    return null
  }

  const usuarioOrigen = await obtenerUsuarioOrigen(authUser.id, authUser.email)

  if (!usuarioOrigen) {
    await supabase.auth.signOut()
    return null
  }

  return usuarioOrigen
}

export async function cerrarSesionSupabase(): Promise<void> {
  await supabase.auth.signOut()
}