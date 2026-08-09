import { useState } from 'react'
import { Check, Palette } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

/**
 * Selector de color del tema. Muestra un botón elegante con el color
 * actual y despliega las paletas disponibles al hacer clic.
 * Se puede usar en la barra lateral, header o cualquier página.
 */
export function ThemeSwitcher() {
  const { paleta, cambiarPaleta, paletas } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      {/* Botón principal */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left text-white transition hover:bg-white/20"
        aria-label="Cambiar color del tema"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ backgroundColor: paleta.primary }}
        >
          <Palette size={16} className="text-white" />
        </span>

        <span className="flex-1">
          <span className="block text-sm font-black">Color del tema</span>
          <span className="block text-xs text-surface-300">{paleta.nombre}</span>
        </span>

        <span
          className={`text-surface-300 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>

      {/* Panel desplegable */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-surface-200 bg-white p-3 shadow-xl">
            <p className="px-1 pb-2 text-xs font-black uppercase tracking-wide text-surface-500">
              Color principal
            </p>

            <div className="grid grid-cols-3 gap-2">
              {paletas.map((item) => {
                const activa = item.id === paleta.id

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      cambiarPaleta(item.id)
                      setOpen(false)
                    }}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition ${
                      activa
                        ? 'border-surface-950'
                        : 'border-transparent hover:border-surface-300'
                    }`}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: item.primary }}
                    >
                      {activa && <Check size={16} className="text-white" />}
                    </span>

                    <span className="text-[10px] font-black text-surface-700">
                      {item.nombre}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
