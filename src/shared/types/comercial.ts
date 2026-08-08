export interface Servicio {
  id: string
  nombre: string
  tipo: 'membresia' | 'personalizado' | 'producto_servicio' | 'otro'
  precio: number
  duracionDias: number
  activo: boolean
  fechaCreacion: string
}

export interface MovimientoCaja {
  id: string
  tipo: 'ingreso' | 'gasto'
  concepto: string
  valor: number
  fecha: string
  personaId?: string
  servicioId?: string
  metodoPago?: string
  observacion?: string
}