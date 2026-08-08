import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  it('permite entrar en modo demo con un correo conocido', () => {
    const onLogin = vi.fn()

    render(<LoginPage onLogin={onLogin} />)

    fireEvent.change(screen.getByLabelText('Correo'), {
      target: { value: 'admin@origen.test' },
    })

    fireEvent.click(screen.getByRole('button', { name: /entrar a origen/i }))

    expect(onLogin).toHaveBeenCalledWith(
      expect.objectContaining({
        correo: 'admin@origen.test',
        rol: 'admin',
      }),
    )
  })
})
