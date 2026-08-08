import { ORIGEN_ADMIN_ID, ORIGEN_GIMNASIO_ID, ORIGEN_SEDE_ID } from '@/shared/lib/origenConfig'
import { supabase } from '@/shared/lib/supabase'
import type { MovimientoInventario, Producto } from '@/shared/types/tienda'

interface ProductoRow {
  id: string
  gimnasio_id: string
  sede_id: string | null
  nombre: string
  categoria: string
  precio_venta: number
  costo: number
  stock: number
  activo: boolean
  fecha_creacion: string
}

interface MovimientoInventarioRow {
  id: string
  gimnasio_id: string
  sede_id: string | null
  producto_id: string
  tipo: MovimientoInventario['tipo']
  cantidad: number
  fecha: string
  observacion: string | null
}

function mapProducto(row: ProductoRow): Producto {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    precioVenta: Number(row.precio_venta),
    costo: Number(row.costo),
    stock: row.stock,
    activo: row.activo,
    fechaCreacion: row.fecha_creacion.slice(0, 10),
  }
}

function mapMovimientoInventario(row: MovimientoInventarioRow): MovimientoInventario {
  return {
    id: row.id,
    productoId: row.producto_id,
    tipo: row.tipo,
    cantidad: row.cantidad,
    fecha: row.fecha,
    observacion: row.observacion ?? undefined,
  }
}

export async function listarProductos(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from('productos')
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      nombre,
      categoria,
      precio_venta,
      costo,
      stock,
      activo,
      fecha_creacion
    `,
    )
    .eq('gimnasio_id', ORIGEN_GIMNASIO_ID)
    .order('nombre', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapProducto(row as ProductoRow))
}

export async function crearProductoSupabase(producto: Producto): Promise<Producto> {
  const { data, error } = await supabase
    .from('productos')
    .insert({
      id: producto.id,
      gimnasio_id: ORIGEN_GIMNASIO_ID,
      sede_id: ORIGEN_SEDE_ID,
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio_venta: producto.precioVenta,
      costo: producto.costo,
      stock: producto.stock,
      activo: producto.activo,
    })
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      nombre,
      categoria,
      precio_venta,
      costo,
      stock,
      activo,
      fecha_creacion
    `,
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapProducto(data as ProductoRow)
}

export async function actualizarProductoSupabase(producto: Producto): Promise<Producto> {
  const { data, error } = await supabase
    .from('productos')
    .update({
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio_venta: producto.precioVenta,
      costo: producto.costo,
      stock: producto.stock,
      activo: producto.activo,
    })
    .eq('id', producto.id)
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      nombre,
      categoria,
      precio_venta,
      costo,
      stock,
      activo,
      fecha_creacion
    `,
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapProducto(data as ProductoRow)
}

export async function listarMovimientosInventario(): Promise<MovimientoInventario[]> {
  const { data, error } = await supabase
    .from('movimientos_inventario')
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      producto_id,
      tipo,
      cantidad,
      fecha,
      observacion
    `,
    )
    .eq('gimnasio_id', ORIGEN_GIMNASIO_ID)
    .order('fecha', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) =>
    mapMovimientoInventario(row as MovimientoInventarioRow),
  )
}

export async function crearMovimientoInventarioSupabase(
  movimiento: MovimientoInventario,
): Promise<MovimientoInventario> {
  const { data, error } = await supabase
    .from('movimientos_inventario')
    .insert({
      id: movimiento.id,
      gimnasio_id: ORIGEN_GIMNASIO_ID,
      sede_id: ORIGEN_SEDE_ID,
      producto_id: movimiento.productoId,
      tipo: movimiento.tipo,
      cantidad: movimiento.cantidad,
      fecha: movimiento.fecha,
      observacion: movimiento.observacion ?? null,
      creado_por: ORIGEN_ADMIN_ID,
    })
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      producto_id,
      tipo,
      cantidad,
      fecha,
      observacion
    `,
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapMovimientoInventario(data as MovimientoInventarioRow)
}