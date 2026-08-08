import { supabase } from '@/shared/lib/supabase'

export interface UsuarioAutenticadoConGimnasio {
  id: string
  email: string | undefined
  gimnasioId: string | null
}

export async function obtenerGimnasioDelUsuarioAutenticado(): Promise<string | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session?.user?.id) {
    return null
  }

  const { data, error: errorUsuario } = await supabase
    .from('usuarios')
    .select('gimnasio_id')
    .eq('auth_user_id', session.user.id)
    .maybeSingle()

  if (errorUsuario) {
    throw new Error(errorUsuario.message)
  }

  return data?.gimnasio_id ?? null
}
