import { ORIGEN_ADMIN_ID, ORIGEN_GIMNASIO_ID, ORIGEN_SEDE_ID } from '@/shared/lib/origenConfig'
import { supabase } from '@/shared/lib/supabase'
import type { PlanEntrenamiento } from '@/shared/types/entrenamiento'

interface PlanEntrenamientoRow {
  id: string
  gimnasio_id: string
  sede_id: string | null
  persona_id: string
  nombre: string
  objetivo: string
  dias_semana: number
  descripcion: string
  estado: PlanEntrenamiento['estado']
  creado_por: string | null
  fecha_creacion: string
}

function mapPlanEntrenamiento(row: PlanEntrenamientoRow): PlanEntrenamiento {
  return {
    id: row.id,
    personaId: row.persona_id,
    nombre: row.nombre,
    objetivo: row.objetivo,
    diasSemana: row.dias_semana,
    descripcion: row.descripcion,
    estado: row.estado,
    fechaCreacion: row.fecha_creacion,
  }
}

export async function listarPlanesEntrenamiento(): Promise<PlanEntrenamiento[]> {
  const { data, error } = await supabase
    .from('planes_entrenamiento')
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      persona_id,
      nombre,
      objetivo,
      dias_semana,
      descripcion,
      estado,
      creado_por,
      fecha_creacion
    `,
    )
    .eq('gimnasio_id', ORIGEN_GIMNASIO_ID)
    .order('fecha_creacion', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapPlanEntrenamiento(row as PlanEntrenamientoRow))
}

export async function crearPlanEntrenamientoSupabase(
  plan: PlanEntrenamiento,
): Promise<PlanEntrenamiento> {
  const { data, error } = await supabase
    .from('planes_entrenamiento')
    .insert({
      id: plan.id,
      gimnasio_id: ORIGEN_GIMNASIO_ID,
      sede_id: ORIGEN_SEDE_ID,
      persona_id: plan.personaId,
      nombre: plan.nombre,
      objetivo: plan.objetivo,
      dias_semana: plan.diasSemana,
      descripcion: plan.descripcion,
      estado: plan.estado,
      creado_por: ORIGEN_ADMIN_ID,
      fecha_creacion: plan.fechaCreacion,
    })
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      persona_id,
      nombre,
      objetivo,
      dias_semana,
      descripcion,
      estado,
      creado_por,
      fecha_creacion
    `,
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapPlanEntrenamiento(data as PlanEntrenamientoRow)
}