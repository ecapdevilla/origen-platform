import type { RolUsuario } from '@/shared/types/auth'

export interface UsuarioSistema {
  id: string
  nombres: string
  apellidos: string
  correo: string
  rol: RolUsuario
  activo: boolean
  authUserId?: string | null
  personaId?: string | null
  fechaCreacion: string
}

export interface CrearUsuarioSistemaInput {
  nombres: string
  apellidos: string
  correo: string
  rol: RolUsuario
  activo: boolean
  authUserId?: string | null
  personaId?: string | null
}