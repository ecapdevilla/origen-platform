export interface Constancia {
  id: string
  personaId: string
  fecha: string
  registradoPor: 'admin' | 'persona'
  observacion?: string
}