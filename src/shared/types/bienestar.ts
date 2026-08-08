export interface RegistroBienestar {
  id: string
  personaId: string
  fecha: string
  estadoAnimo: string
  horasSueno: number
  vasosAgua: number
  energia: number
  nota?: string
}