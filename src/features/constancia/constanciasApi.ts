import { ORIGEN_ADMIN_ID, ORIGEN_GIMNASIO_ID, ORIGEN_SEDE_ID } from '@/shared/lib/origenConfig'
import { supabase } from '@/shared/lib/supabase'
import type { Constancia } from '@/shared/types/constancia'

interface ConstanciaRow {
  id: string
  gimnasio_id: string
  sede_id: string | null
  persona_id: string
  fecha: string
  registrado_por_rol: string
  registrado_por_usuario_id: string | null
  observacion: string | null
}

function mapConstancia(row: ConstanciaRow): Constancia {
  return {
    id: row.id,
    personaId: row.persona_id,
    fecha: row.fecha,
    registradoPor: row.registrado_por_rol === 'persona' ? 'persona' : 'admin',
    observacion: row.observacion ?? undefined,
  }
}

export async function listarConstancias(): Promise<Constancia[]> {
  const { data, error } = await supabase
    .from('constancias')
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      persona_id,
      fecha,
      registrado_por_rol,
      registrado_por_usuario_id,
      observacion
    `,
    )
    .eq('gimnasio_id', ORIGEN_GIMNASIO_ID)
    .order('fecha', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapConstancia(row as ConstanciaRow))
}

export async function crearConstanciaSupabase(
  personaId: string,
  registradoPor: Constancia['registradoPor'] = 'admin',
): Promise<Constancia> {
  const { data, error } = await supabase
    .from('constancias')
    .insert({
      id: crypto.randomUUID(),
      gimnasio_id: ORIGEN_GIMNASIO_ID,
      sede_id: ORIGEN_SEDE_ID,
      persona_id: personaId,
      fecha: new Date().toISOString().slice(0, 10),
      registrado_por_rol: registradoPor,
      registrado_por_usuario_id: registradoPor === 'admin' ? ORIGEN_ADMIN_ID : null,
      observacion:
        registradoPor === 'admin'
          ? 'Registrada desde administración'
          : 'Registrada desde portal persona',
    })
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      persona_id,
      fecha,
      registrado_por_rol,
      registrado_por_usuario_id,
      observacion
    `,
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapConstancia(data as ConstanciaRow)
}