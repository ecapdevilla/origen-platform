export type RolUsuario = 'admin' | 'entrenador' | 'persona'

export interface SesionUsuario {
  id: string
  nombre: string
  correo: string
  rol: RolUsuario
  personaId?: string | null
}