export interface Producto {
  id: string
  nombre: string
  categoria: string
  precioVenta: number
  costo: number
  stock: number
  activo: boolean
  fechaCreacion: string
}

export interface MovimientoInventario {
  id: string
  productoId: string
  tipo: 'entrada' | 'venta'
  cantidad: number
  fecha: string
  observacion?: string
}