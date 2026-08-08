import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockObtenerSesionActualSupabase } = vi.hoisted(() => ({
  mockObtenerSesionActualSupabase: vi.fn(),
}))

vi.mock('@/features/auth/authApi', () => ({
  obtenerSesionActualSupabase: mockObtenerSesionActualSupabase,
  cerrarSesionSupabase: vi.fn(),
}))

import App from './App'

describe('App smoke test', () => {
  beforeEach(() => {
    mockObtenerSesionActualSupabase.mockReset()
    mockObtenerSesionActualSupabase.mockResolvedValue(null)
  })

  it('renders the login screen when there is no active session', async () => {
    render(<App />)

    expect(await screen.findByText('Iniciar sesión')).toBeTruthy()
    expect(screen.getByText('Acceso seguro')).toBeTruthy()
  })
})
