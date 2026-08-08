export type EstadoPersona = 'activa' | 'en_pausa' | 'registro' | 'historica'

export interface Persona {
  id: string
  nombres: string
  apellidos: string
  documento: string
  telefono: string
  correo: string
  objetivo: string
  estado: EstadoPersona
  referidoPor?: string
  fechaRegistro: string
}