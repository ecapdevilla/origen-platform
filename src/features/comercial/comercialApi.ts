import { ORIGEN_ADMIN_ID, ORIGEN_GIMNASIO_ID, ORIGEN_SEDE_ID } from '@/shared/lib/origenConfig'
import { supabase } from '@/shared/lib/supabase'
import type { MovimientoCaja, Servicio } from '@/shared/types/comercial'

interface ServicioRow {
  id: string
  gimnasio_id: string
  sede_id: string | null
  nombre: string
  tipo: Servicio['tipo']
  precio: number
  duracion_dias: number
  activo: boolean
  fecha_creacion: string
}

interface MovimientoCajaRow {
  id: string
  gimnasio_id: string
  sede_id: string | null
  persona_id: string | null
  servicio_id: string | null
  tipo: MovimientoCaja['tipo']
  concepto: string
  valor: number
  fecha: string
  metodo_pago: string | null
  observacion: string | null
}

function mapServicio(row: ServicioRow): Servicio {
  return {
    id: row.id,
    nombre: row.nombre,
    tipo: row.tipo,
    precio: Number(row.precio),
    duracionDias: row.duracion_dias,
    activo: row.activo,
    fechaCreacion: row.fecha_creacion.slice(0, 10),
  }
}

function mapMovimientoCaja(row: MovimientoCajaRow): MovimientoCaja {
  return {
    id: row.id,
    tipo: row.tipo,
    concepto: row.concepto,
    valor: Number(row.valor),
    fecha: row.fecha,
    personaId: row.persona_id ?? undefined,
    servicioId: row.servicio_id ?? undefined,
    metodoPago: row.metodo_pago ?? undefined,
    observacion: row.observacion ?? undefined,
  }
}

export async function listarServicios(): Promise<Servicio[]> {
  const { data, error } = await supabase
    .from('servicios')
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      nombre,
      tipo,
      precio,
      duracion_dias,
      activo,
      fecha_creacion
    `,
    )
    .eq('gimnasio_id', ORIGEN_GIMNASIO_ID)
    .order('fecha_creacion', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapServicio(row as ServicioRow))
}

export async function crearServicioSupabase(servicio: Servicio): Promise<Servicio> {
  const { data, error } = await supabase
    .from('servicios')
    .insert({
      id: servicio.id,
      gimnasio_id: ORIGEN_GIMNASIO_ID,
      sede_id: ORIGEN_SEDE_ID,
      nombre: servicio.nombre,
      tipo: servicio.tipo,
      precio: servicio.precio,
      duracion_dias: servicio.duracionDias,
      activo: servicio.activo,
    })
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      nombre,
      tipo,
      precio,
      duracion_dias,
      activo,
      fecha_creacion
    `,
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapServicio(data as ServicioRow)
}

export async function listarMovimientosCaja(): Promise<MovimientoCaja[]> {
  const { data, error } = await supabase
    .from('movimientos_caja')
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      persona_id,
      servicio_id,
      tipo,
      concepto,
      valor,
      fecha,
      metodo_pago,
      observacion
    `,
    )
    .eq('gimnasio_id', ORIGEN_GIMNASIO_ID)
    .order('fecha', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapMovimientoCaja(row as MovimientoCajaRow))
}

export async function crearMovimientoCajaSupabase(
  movimiento: MovimientoCaja,
): Promise<MovimientoCaja> {
  const { data, error } = await supabase
    .from('movimientos_caja')
    .insert({
      id: movimiento.id,
      gimnasio_id: ORIGEN_GIMNASIO_ID,
      sede_id: ORIGEN_SEDE_ID,
      persona_id: movimiento.personaId ?? null,
      servicio_id: movimiento.servicioId ?? null,
      tipo: movimiento.tipo,
      concepto: movimiento.concepto,
      valor: movimiento.valor,
      fecha: movimiento.fecha,
      metodo_pago: movimiento.metodoPago ?? null,
      observacion: movimiento.observacion ?? null,
      creado_por: ORIGEN_ADMIN_ID,
    })
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      persona_id,
      servicio_id,
      tipo,
      concepto,
      valor,
      fecha,
      metodo_pago,
      observacion
    `,
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapMovimientoCaja(data as MovimientoCajaRow)
}