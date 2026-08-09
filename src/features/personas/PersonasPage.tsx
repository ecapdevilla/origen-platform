import { useState } from 'react'
import type { RegistroBienestar } from '@/shared/types/bienestar'
import type { MovimientoCaja } from '@/shared/types/comercial'
import type { Constancia } from '@/shared/types/constancia'
import type { PlanEntrenamiento } from '@/shared/types/entrenamiento'
import type { EstadoPersona, Persona } from '@/shared/types/persona'
import type { MedidaCorporal } from '@/shared/types/progreso'
import { PersonaList } from './PersonaList'
import { PersonaForm } from './PersonaForm'
import { PersonaDetail } from './PersonaDetail'

interface Props {
  personas: Persona[]
  constancias: Constancia[]
  movimientos: MovimientoCaja[]
  planes: PlanEntrenamiento[]
  registrosBienestar: RegistroBienestar[]
  medidas: MedidaCorporal[]
  onCreatePersona: (persona: Persona) => void
  onUpdatePersona: (persona: Persona) => void
  onChangeEstado: (id: string, estado: EstadoPersona) => void
  onCreateMedida: (medida: MedidaCorporal) => void
}

type Vista = 'lista' | 'nueva' | 'detalle'

export function PersonasPage({
  personas,
  constancias,
  movimientos,
  planes,
  registrosBienestar,
  medidas,
  onCreatePersona,
  onUpdatePersona,
  onChangeEstado,
  onCreateMedida,
}: Props) {
  const [vista, setVista] = useState<Vista>('lista')
  const [personaId, setPersonaId] = useState<string | null>(null)
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const personaSeleccionada = personas.find((persona) => persona.id === personaId) ?? null

  function abrirNueva() {
    setEditandoId(null)
    setVista('nueva')
  }

  function abrirEdicion(persona: Persona) {
    setEditandoId(persona.id)
    setVista('nueva')
  }

  function abrirDetalle(persona: Persona) {
    setPersonaId(persona.id)
    setVista('detalle')
  }

  function volverALista() {
    setVista('lista')
    setPersonaId(null)
    setEditandoId(null)
  }

  if (vista === 'nueva') {
    return (
      <PersonaForm
        personas={personas}
        editandoId={editandoId}
        onCreatePersona={onCreatePersona}
        onUpdatePersona={onUpdatePersona}
        onVolver={volverALista}
        onGuardada={(persona) => {
          setPersonaId(persona.id)
          setVista('detalle')
        }}
      />
    )
  }

  if (vista === 'detalle' && personaSeleccionada) {
    return (
      <PersonaDetail
        persona={personaSeleccionada}
        constancias={constancias}
        movimientos={movimientos}
        planes={planes}
        registrosBienestar={registrosBienestar}
        medidas={medidas}
        onChangeEstado={onChangeEstado}
        onCreateMedida={onCreateMedida}
        onEditar={abrirEdicion}
        onVolver={volverALista}
      />
    )
  }

  return (
    <PersonaList
      personas={personas}
      onNueva={abrirNueva}
      onVerDetalle={abrirDetalle}
      onEditar={abrirEdicion}
    />
  )
}
