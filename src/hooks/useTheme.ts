import { useCallback, useEffect, useState } from 'react'

/**
 * Paletas de color principal disponibles para el tema.
 * Cada paleta define los tres tonos que se aplican a las variables
 * CSS --brand-primary*, que controlan surface-950/900/800.
 */
export interface PaletaTema {
  id: string
  nombre: string
  /** Color principal (surface-950) */
  primary: string
  /** Variante hover / más clara (surface-900) */
  dark: string
  /** Variante aún más clara (surface-800) */
  darker: string
}

export const PALETAS_TEMA: PaletaTema[] = [
  {
    id: 'carbon',
    nombre: 'Carbón',
    primary: '#0c0a09',
    dark: '#1c1917',
    darker: '#292524',
  },
  {
    id: 'naranja',
    nombre: 'Naranja',
    primary: '#c2410c',
    dark: '#9a3412',
    darker: '#7c2d12',
  },
  {
    id: 'azul',
    nombre: 'Azul',
    primary: '#1e3a8a',
    dark: '#1e40af',
    darker: '#1d4ed8',
  },
  {
    id: 'verde',
    nombre: 'Verde',
    primary: '#064e3b',
    dark: '#065f46',
    darker: '#047857',
  },
  {
    id: 'violeta',
    nombre: 'Violeta',
    primary: '#4c1d95',
    dark: '#5b21b6',
    darker: '#6d28d9',
  },
  {
    id: 'rojo',
    nombre: 'Rojo',
    primary: '#881337',
    dark: '#9f1239',
    darker: '#be123c',
  },
]

const STORAGE_KEY = 'origen-tema-color'

/** Aplica una paleta a las variables CSS del documento. */
function aplicarPaleta(paleta: PaletaTema) {
  const root = document.documentElement

  root.style.setProperty('--brand-primary', paleta.primary)
  root.style.setProperty('--brand-primary-dark', paleta.dark)
  root.style.setProperty('--brand-primary-darker', paleta.darker)
}

/** Lee la paleta guardada en localStorage o usa la primera por defecto. */
function leerPaletaGuardada(): PaletaTema {
  if (typeof window === 'undefined') return PALETAS_TEMA[0]

  const guardada = window.localStorage.getItem(STORAGE_KEY)

  if (guardada) {
    const encontrada = PALETAS_TEMA.find((paleta) => paleta.id === guardada)

    if (encontrada) return encontrada
  }

  return PALETAS_TEMA[0]
}

/**
 * Hook para gestionar el color principal del tema en tiempo real.
 * Cambia las variables CSS --brand-primary* y persiste la selección
 * en localStorage para que se mantenga entre sesiones.
 */
export function useTheme() {
  const [paleta, setPaleta] = useState<PaletaTema>(leerPaletaGuardada)

  useEffect(() => {
    aplicarPaleta(paleta)
  }, [paleta])

  const cambiarPaleta = useCallback((id: string) => {
    const nueva = PALETAS_TEMA.find((item) => item.id === id)

    if (!nueva) return

    setPaleta(nueva)
    window.localStorage.setItem(STORAGE_KEY, nueva.id)
  }, [])

  return {
    paleta,
    cambiarPaleta,
    paletas: PALETAS_TEMA,
  }
}
