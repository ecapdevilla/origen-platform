export interface PlanEntrenamiento {
  id: string
  personaId: string
  nombre: string
  objetivo: string
  diasSemana: number
  descripcion: string
  estado: 'sugerido' | 'aprobado' | 'activo' | 'finalizado'
  fechaCreacion: string
}