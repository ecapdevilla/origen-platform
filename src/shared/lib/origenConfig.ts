import { obtenerGimnasioDelUsuarioAutenticado } from '@/shared/lib/authHelpers'

export const ORIGEN_GIMNASIO_ID = '00000000-0000-0000-0000-000000000001'

export const ORIGEN_SEDE_ID = '00000000-0000-0000-0000-000000000101'

export const ORIGEN_ADMIN_ID = '00000000-0000-0000-0000-000000000201'

let gimnasioCache: string | null = null

export async function obtenerGimnasioActual(): Promise<string> {
  if (gimnasioCache) {
    return gimnasioCache
  }

  gimnasioCache = await obtenerGimnasioDelUsuarioAutenticado()

  return gimnasioCache ?? '00000000-0000-0000-0000-000000000001'
}

export function resetGimnasioActual() {
  gimnasioCache = null
}
