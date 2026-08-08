import {
  ORIGEN_ADMIN_ID,
  ORIGEN_GIMNASIO_ID,
  ORIGEN_SEDE_ID,
} from '@/shared/lib/origenConfig'
import { supabase } from '@/shared/lib/supabase'
import type { RegistroBienestar } from '@/shared/types/bienestar'

interface RegistroBienestarRow {
  id: string
  gimnasio_id: string
  sede_id: string | null
  persona_id: string
  fecha: string
  estado_animo: string
  horas_sueno: number
  vasos_agua: number
  energia: number
  nota: string | null
  creado_por: string | null
}

function mapRegistroBienestar(row: RegistroBienestarRow): RegistroBienestar {
  return {
    id: row.id,
    personaId: row.persona_id,
    fecha: row.fecha,
    estadoAnimo: row.estado_animo,
    horasSueno: Number(row.horas_sueno),
    vasosAgua: row.vasos_agua,
    energia: row.energia,
    nota: row.nota ?? undefined,
  }
}

export async function listarRegistrosBienestar(): Promise<RegistroBienestar[]> {
  const { data, error } = await supabase
    .from('registros_bienestar')
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      persona_id,
      fecha,
      estado_animo,
      horas_sueno,
      vasos_agua,
      energia,
      nota,
      creado_por
    `,
    )
    .eq('gimnasio_id', ORIGEN_GIMNASIO_ID)
    .order('fecha', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapRegistroBienestar(row as RegistroBienestarRow))
}

export async function crearRegistroBienestarSupabase(
  registro: RegistroBienestar,
): Promise<RegistroBienestar> {
  const { data, error } = await supabase
    .from('registros_bienestar')
    .insert({
      id: registro.id,
      gimnasio_id: ORIGEN_GIMNASIO_ID,
      sede_id: ORIGEN_SEDE_ID,
      persona_id: registro.personaId,
      fecha: registro.fecha,
      estado_animo: registro.estadoAnimo,
      horas_sueno: registro.horasSueno,
      vasos_agua: registro.vasosAgua,
      energia: registro.energia,
      nota: registro.nota ?? null,
      creado_por: ORIGEN_ADMIN_ID,
    })
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      persona_id,
      fecha,
      estado_animo,
      horas_sueno,
      vasos_agua,
      energia,
      nota,
      creado_por
    `,
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapRegistroBienestar(data as RegistroBienestarRow)
}