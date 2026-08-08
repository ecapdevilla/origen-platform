import {
  ORIGEN_ADMIN_ID,
  ORIGEN_GIMNASIO_ID,
  ORIGEN_SEDE_ID,
} from '@/shared/lib/origenConfig'
import { supabase } from '@/shared/lib/supabase'
import type { MedidaCorporal } from '@/shared/types/progreso'

interface MedidaCorporalRow {
  id: string
  gimnasio_id: string
  sede_id: string | null
  persona_id: string
  fecha: string
  peso_kg: number
  estatura_cm: number
  cintura_cm: number | null
  pecho_cm: number | null
  brazo_cm: number | null
  pierna_cm: number | null
  observacion: string | null
  creado_por: string | null
}

function mapMedidaCorporal(row: MedidaCorporalRow): MedidaCorporal {
  return {
    id: row.id,
    personaId: row.persona_id,
    fecha: row.fecha,
    pesoKg: Number(row.peso_kg),
    estaturaCm: Number(row.estatura_cm),
    cinturaCm: row.cintura_cm === null ? undefined : Number(row.cintura_cm),
    pechoCm: row.pecho_cm === null ? undefined : Number(row.pecho_cm),
    brazoCm: row.brazo_cm === null ? undefined : Number(row.brazo_cm),
    piernaCm: row.pierna_cm === null ? undefined : Number(row.pierna_cm),
    observacion: row.observacion ?? undefined,
  }
}

export async function listarMedidasCorporales(): Promise<MedidaCorporal[]> {
  const { data, error } = await supabase
    .from('medidas_corporales')
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      persona_id,
      fecha,
      peso_kg,
      estatura_cm,
      cintura_cm,
      pecho_cm,
      brazo_cm,
      pierna_cm,
      observacion,
      creado_por
    `,
    )
    .eq('gimnasio_id', ORIGEN_GIMNASIO_ID)
    .order('fecha', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapMedidaCorporal(row as MedidaCorporalRow))
}

export async function crearMedidaCorporalSupabase(
  medida: MedidaCorporal,
): Promise<MedidaCorporal> {
  const { data, error } = await supabase
    .from('medidas_corporales')
    .insert({
      id: medida.id,
      gimnasio_id: ORIGEN_GIMNASIO_ID,
      sede_id: ORIGEN_SEDE_ID,
      persona_id: medida.personaId,
      fecha: medida.fecha,
      peso_kg: medida.pesoKg,
      estatura_cm: medida.estaturaCm,
      cintura_cm: medida.cinturaCm ?? null,
      pecho_cm: medida.pechoCm ?? null,
      brazo_cm: medida.brazoCm ?? null,
      pierna_cm: medida.piernaCm ?? null,
      observacion: medida.observacion ?? null,
      creado_por: ORIGEN_ADMIN_ID,
    })
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      persona_id,
      fecha,
      peso_kg,
      estatura_cm,
      cintura_cm,
      pecho_cm,
      brazo_cm,
      pierna_cm,
      observacion,
      creado_por
    `,
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapMedidaCorporal(data as MedidaCorporalRow)
}