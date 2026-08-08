import { ORIGEN_GIMNASIO_ID, ORIGEN_SEDE_ID } from '@/shared/lib/origenConfig'
import { supabase } from '@/shared/lib/supabase'
import type {
  CrearUsuarioSistemaInput,
  UsuarioSistema,
} from '@/shared/types/usuario'

interface UsuarioSistemaRow {
  id: string
  nombres: string
  apellidos: string
  correo: string
  rol: UsuarioSistema['rol']
  activo: boolean
  auth_user_id: string | null
  persona_id: string | null
  fecha_creacion: string
}

function mapUsuario(row: UsuarioSistemaRow): UsuarioSistema {
  return {
    id: row.id,
    nombres: row.nombres,
    apellidos: row.apellidos,
    correo: row.correo,
    rol: row.rol,
    activo: row.activo,
    authUserId: row.auth_user_id,
    personaId: row.persona_id,
    fechaCreacion: row.fecha_creacion,
  }
}

export async function listarUsuariosSistema(): Promise<UsuarioSistema[]> {
  const { data, error } = await supabase
    .from('usuarios')
    .select(
      'id, nombres, apellidos, correo, rol, activo, auth_user_id, persona_id, fecha_creacion',
    )
    .eq('gimnasio_id', ORIGEN_GIMNASIO_ID)
    .order('fecha_creacion', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data as UsuarioSistemaRow[]).map(mapUsuario)
}

export async function crearUsuarioSistemaSupabase(
  usuario: CrearUsuarioSistemaInput,
): Promise<UsuarioSistema> {
  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      gimnasio_id: ORIGEN_GIMNASIO_ID,
      sede_id: ORIGEN_SEDE_ID,
      nombres: usuario.nombres.trim(),
      apellidos: usuario.apellidos.trim(),
      correo: usuario.correo.trim().toLowerCase(),
      rol: usuario.rol,
      activo: usuario.activo,
      auth_user_id: usuario.authUserId || null,
      persona_id: usuario.personaId || null,
    })
    .select(
      'id, nombres, apellidos, correo, rol, activo, auth_user_id, persona_id, fecha_creacion',
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapUsuario(data as UsuarioSistemaRow)
}

export async function actualizarUsuarioSistemaSupabase(
  usuario: UsuarioSistema,
): Promise<UsuarioSistema> {
  const { data, error } = await supabase
    .from('usuarios')
    .update({
      nombres: usuario.nombres.trim(),
      apellidos: usuario.apellidos.trim(),
      correo: usuario.correo.trim().toLowerCase(),
      rol: usuario.rol,
      activo: usuario.activo,
      auth_user_id: usuario.authUserId || null,
      persona_id: usuario.personaId || null,
    })
    .eq('id', usuario.id)
    .select(
      'id, nombres, apellidos, correo, rol, activo, auth_user_id, persona_id, fecha_creacion',
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapUsuario(data as UsuarioSistemaRow)
}

export async function cambiarEstadoUsuarioSistemaSupabase(
  usuarioId: string,
  activo: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('usuarios')
    .update({ activo })
    .eq('id', usuarioId)

  if (error) {
    throw new Error(error.message)
  }
}