import { ORIGEN_GIMNASIO_ID } from '@/shared/lib/origenConfig'
import { supabase } from '@/shared/lib/supabase'
import type { ConfiguracionGimnasio } from '@/shared/types/configuracion'

interface GimnasioRow {
  id: string
  nombre: string
  lema: string | null
  telefono: string | null
  direccion: string | null
}

interface ConfiguracionRow {
  id: string
  gimnasio_id: string
  termino_personas: string
  tono: string
  color_principal: string | null
  moneda: string
  zona_horaria: string
}

const defaultConfiguracion: ConfiguracionGimnasio = {
  nombre: 'ORIGEN',
  lema: 'Cada persona importa. Cada hábito cuenta. Cada logro merece ser celebrado.',
  telefono: '3000000000',
  direccion: 'Barranquilla, Colombia',
  terminoPersonas: 'Personas',
  tono: 'Cercano',
}

function mapConfiguracion(
  gimnasio: GimnasioRow,
  configuracion: ConfiguracionRow | null,
): ConfiguracionGimnasio {
  return {
    nombre: gimnasio.nombre,
    lema: gimnasio.lema ?? '',
    telefono: gimnasio.telefono ?? '',
    direccion: gimnasio.direccion ?? '',
    terminoPersonas: configuracion?.termino_personas ?? 'Personas',
    tono: configuracion?.tono ?? 'Cercano',
  }
}

export async function obtenerConfiguracionGimnasio(): Promise<ConfiguracionGimnasio> {
  const { data: gimnasioData, error: gimnasioError } = await supabase
    .from('gimnasios')
    .select(
      `
      id,
      nombre,
      lema,
      telefono,
      direccion
    `,
    )
    .eq('id', ORIGEN_GIMNASIO_ID)
    .maybeSingle()

  if (gimnasioError) {
    throw new Error(gimnasioError.message)
  }

  if (!gimnasioData) {
    return defaultConfiguracion
  }

  const { data: configuracionData, error: configuracionError } = await supabase
    .from('configuracion_gimnasio')
    .select(
      `
      id,
      gimnasio_id,
      termino_personas,
      tono,
      color_principal,
      moneda,
      zona_horaria
    `,
    )
    .eq('gimnasio_id', ORIGEN_GIMNASIO_ID)
    .maybeSingle()

  if (configuracionError) {
    throw new Error(configuracionError.message)
  }

  return mapConfiguracion(
    gimnasioData as GimnasioRow,
    configuracionData as ConfiguracionRow | null,
  )
}

export async function actualizarConfiguracionGimnasio(
  configuracion: ConfiguracionGimnasio,
): Promise<ConfiguracionGimnasio> {
  const { error: gimnasioError } = await supabase
    .from('gimnasios')
    .update({
      nombre: configuracion.nombre,
      lema: configuracion.lema,
      telefono: configuracion.telefono,
      direccion: configuracion.direccion,
    })
    .eq('id', ORIGEN_GIMNASIO_ID)

  if (gimnasioError) {
    throw new Error(gimnasioError.message)
  }

  const { error: configuracionError } = await supabase
    .from('configuracion_gimnasio')
    .upsert(
      {
        gimnasio_id: ORIGEN_GIMNASIO_ID,
        termino_personas: configuracion.terminoPersonas,
        tono: configuracion.tono,
        color_principal: '#020617',
        moneda: 'COP',
        zona_horaria: 'America/Bogota',
      },
      {
        onConflict: 'gimnasio_id',
      },
    )

  if (configuracionError) {
    throw new Error(configuracionError.message)
  }

  return obtenerConfiguracionGimnasio()
}