import { supabase } from '@/shared/lib/supabase'
import { ORIGEN_GIMNASIO_ID, ORIGEN_SEDE_ID } from '@/shared/lib/origenConfig'
import type { EstadoPersona, Persona } from '@/shared/types/persona'

interface PersonaRow {
  id: string
  gimnasio_id: string
  sede_id: string | null
  usuario_id: string | null
  nombres: string
  apellidos: string
  documento: string
  telefono: string | null
  correo: string | null
  objetivo: string | null
  estado: EstadoPersona
  referido_por: string | null
  fecha_registro: string
}

function mapPersona(row: PersonaRow): Persona {
  return {
    id: row.id,
    nombres: row.nombres,
    apellidos: row.apellidos,
    documento: row.documento,
    telefono: row.telefono ?? '',
    correo: row.correo ?? '',
    objetivo: row.objetivo ?? '',
    estado: row.estado,
    referidoPor: row.referido_por ?? undefined,
    fechaRegistro: row.fecha_registro,
  }
}

export async function listarPersonas(): Promise<Persona[]> {
  const { data, error } = await supabase
    .from('personas')
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      usuario_id,
      nombres,
      apellidos,
      documento,
      telefono,
      correo,
      objetivo,
      estado,
      referido_por,
      fecha_registro
    `,
    )
    .eq('gimnasio_id', ORIGEN_GIMNASIO_ID)
    .order('nombres', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapPersona(row as PersonaRow))
}

export async function crearPersonaSupabase(persona: Persona): Promise<Persona> {
  const { data, error } = await supabase
    .from('personas')
    .insert({
      id: persona.id,
      gimnasio_id: ORIGEN_GIMNASIO_ID,
      sede_id: ORIGEN_SEDE_ID,
      nombres: persona.nombres,
      apellidos: persona.apellidos,
      documento: persona.documento,
      telefono: persona.telefono || null,
      correo: persona.correo || null,
      objetivo: persona.objetivo || null,
      estado: persona.estado,
      referido_por: persona.referidoPor || null,
      fecha_registro: persona.fechaRegistro,
    })
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      usuario_id,
      nombres,
      apellidos,
      documento,
      telefono,
      correo,
      objetivo,
      estado,
      referido_por,
      fecha_registro
    `,
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapPersona(data as PersonaRow)
}

export async function actualizarPersonaSupabase(persona: Persona): Promise<Persona> {
  const { data, error } = await supabase
    .from('personas')
    .update({
      nombres: persona.nombres,
      apellidos: persona.apellidos,
      documento: persona.documento,
      telefono: persona.telefono || null,
      correo: persona.correo || null,
      objetivo: persona.objetivo || null,
      estado: persona.estado,
      referido_por: persona.referidoPor || null,
      fecha_registro: persona.fechaRegistro,
    })
    .eq('id', persona.id)
    .select(
      `
      id,
      gimnasio_id,
      sede_id,
      usuario_id,
      nombres,
      apellidos,
      documento,
      telefono,
      correo,
      objetivo,
      estado,
      referido_por,
      fecha_registro
    `,
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapPersona(data as PersonaRow)
}

export async function cambiarEstadoPersonaSupabase(
  personaId: string,
  estado: EstadoPersona,
): Promise<void> {
  const { error } = await supabase
    .from('personas')
    .update({ estado })
    .eq('id', personaId)

  if (error) {
    throw new Error(error.message)
  }
}