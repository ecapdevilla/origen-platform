import { useMemo, useState, type FormEvent } from 'react'
import type { RegistroBienestar } from '@/shared/types/bienestar'
import type { MovimientoCaja } from '@/shared/types/comercial'
import type { Constancia } from '@/shared/types/constancia'
import type { PlanEntrenamiento } from '@/shared/types/entrenamiento'
import type { EstadoPersona, Persona } from '@/shared/types/persona'
import type { MedidaCorporal } from '@/shared/types/progreso'

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

interface PersonaForm {
  nombres: string
  apellidos: string
  documento: string
  telefono: string
  correo: string
  objetivo: string
  estado: EstadoPersona
  referidoPor: string
}

interface MedidaForm {
  pesoKg: string
  estaturaCm: string
  cinturaCm: string
  pechoCm: string
  brazoCm: string
  piernaCm: string
  observacion: string
}

const estadoOptions: EstadoPersona[] = ['activa', 'en_pausa', 'registro', 'historica']

const initialForm: PersonaForm = {
  nombres: '',
  apellidos: '',
  documento: '',
  telefono: '',
  correo: '',
  objetivo: '',
  estado: 'registro',
  referidoPor: '',
}

const initialMedidaForm: MedidaForm = {
  pesoKg: '',
  estaturaCm: '',
  cinturaCm: '',
  pechoCm: '',
  brazoCm: '',
  piernaCm: '',
  observacion: '',
}

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
  const [form, setForm] = useState<PersonaForm>(initialForm)
  const [medidaForm, setMedidaForm] = useState<MedidaForm>(initialMedidaForm)
  const [search, setSearch] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | EstadoPersona>('todos')
  const [selectedId, setSelectedId] = useState<string>(personas[0]?.id ?? '')
  const [editingId, setEditingId] = useState<string | null>(null)

  const selectedPersona = personas.find((persona) => persona.id === selectedId) ?? personas[0]

  const personasFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase()

    return personas.filter((persona) => {
      const matchesEstado = estadoFiltro === 'todos' || persona.estado === estadoFiltro

      const texto = [
        persona.nombres,
        persona.apellidos,
        persona.documento,
        persona.telefono,
        persona.correo,
        persona.objetivo,
        persona.referidoPor ?? '',
      ]
        .join(' ')
        .toLowerCase()

      return matchesEstado && (!term || texto.includes(term))
    })
  }, [personas, search, estadoFiltro])

  const personasActivas = personas.filter((persona) => persona.estado === 'activa').length
  const personasRegistro = personas.filter((persona) => persona.estado === 'registro').length
  const personasPausa = personas.filter((persona) => persona.estado === 'en_pausa').length
  const personasHistoricas = personas.filter((persona) => persona.estado === 'historica').length

  const constanciasPersona = useMemo(() => {
    if (!selectedPersona) return []

    return [...constancias]
      .filter((constancia) => constancia.personaId === selectedPersona.id)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [constancias, selectedPersona])

  const movimientosPersona = useMemo(() => {
    if (!selectedPersona) return []

    return [...movimientos]
      .filter((movimiento) => movimiento.personaId === selectedPersona.id)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [movimientos, selectedPersona])

  const planesPersona = useMemo(() => {
    if (!selectedPersona) return []

    return [...planes]
      .filter((plan) => plan.personaId === selectedPersona.id)
      .sort(
        (a, b) =>
          new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime(),
      )
  }, [planes, selectedPersona])

  const bienestarPersona = useMemo(() => {
    if (!selectedPersona) return []

    return [...registrosBienestar]
      .filter((registro) => registro.personaId === selectedPersona.id)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [registrosBienestar, selectedPersona])

  const medidasPersona = useMemo(() => {
    if (!selectedPersona) return []

    return [...medidas]
      .filter((medida) => medida.personaId === selectedPersona.id)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [medidas, selectedPersona])

  const totalPagado = movimientosPersona
    .filter((movimiento) => movimiento.tipo === 'ingreso')
    .reduce((total, movimiento) => total + movimiento.valor, 0)

  const ultimoPlan = planesPersona[0]
  const ultimoBienestar = bienestarPersona[0]
  const ultimaMedida = medidasPersona[0]
  const racha = calcularRacha(constanciasPersona)

  function resetForm() {
    setForm(initialForm)
    setEditingId(null)
  }

  function guardarPersona(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.nombres.trim()) {
      alert('El nombre es obligatorio.')
      return
    }

    if (!form.apellidos.trim()) {
      alert('El apellido es obligatorio.')
      return
    }

    if (!form.documento.trim()) {
      alert('El documento es obligatorio.')
      return
    }

    const personaBase = {
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      documento: form.documento.trim(),
      telefono: form.telefono.trim(),
      correo: form.correo.trim(),
      objetivo: form.objetivo.trim(),
      estado: form.estado,
      referidoPor: form.referidoPor.trim(),
    }

    if (editingId) {
      const personaActual = personas.find((persona) => persona.id === editingId)

      if (!personaActual) return

      const personaEditada: Persona = {
        ...personaActual,
        ...personaBase,
      }

      onUpdatePersona(personaEditada)
      setSelectedId(personaEditada.id)
      resetForm()
      return
    }

    const nuevaPersona: Persona = {
      id: crypto.randomUUID(),
      ...personaBase,
      fechaRegistro: new Date().toISOString().slice(0, 10),
    }

    onCreatePersona(nuevaPersona)
    setSelectedId(nuevaPersona.id)
    resetForm()
  }

  function editarPersona(persona: Persona) {
    setEditingId(persona.id)
    setSelectedId(persona.id)

    setForm({
      nombres: persona.nombres,
      apellidos: persona.apellidos,
      documento: persona.documento,
      telefono: persona.telefono,
      correo: persona.correo,
      objetivo: persona.objetivo,
      estado: persona.estado,
      referidoPor: persona.referidoPor ?? '',
    })
  }

  function guardarMedida(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedPersona) {
      alert('Selecciona una persona.')
      return
    }

    const peso = Number(medidaForm.pesoKg)
    const estatura = Number(medidaForm.estaturaCm)

    if (!peso || peso <= 0) {
      alert('Ingresa un peso válido.')
      return
    }

    if (!estatura || estatura <= 0) {
      alert('Ingresa una estatura válida.')
      return
    }

    const nuevaMedida: MedidaCorporal = {
      id: crypto.randomUUID(),
      personaId: selectedPersona.id,
      fecha: new Date().toISOString().slice(0, 10),
      pesoKg: peso,
      estaturaCm: estatura,
      cinturaCm: toOptionalNumber(medidaForm.cinturaCm),
      pechoCm: toOptionalNumber(medidaForm.pechoCm),
      brazoCm: toOptionalNumber(medidaForm.brazoCm),
      piernaCm: toOptionalNumber(medidaForm.piernaCm),
      observacion: medidaForm.observacion.trim(),
    }

    onCreateMedida(nuevaMedida)
    setMedidaForm(initialMedidaForm)
  }
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_70px_-25px_rgba(15,23,42,0.35)] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">Personas</p>

        <h1 className="mt-3 text-3xl font-black sm:text-4xl">Gestión de personas</h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
          Administra los registros, objetivos, estados, constancia, pagos, bienestar y progreso de cada persona.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Total personas" value={String(personas.length)} />
        <Metric title="Activas" value={String(personasActivas)} />
        <Metric title="En registro" value={String(personasRegistro)} />
        <Metric title="En pausa" value={String(personasPausa)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-2xl font-black">
            {editingId ? 'Editar persona' : 'Registrar persona'}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Ingresa la información principal de la persona.
          </p>

          <form onSubmit={guardarPersona} className="mt-6 grid gap-4">
            <Input
              label="Nombres"
              value={form.nombres}
              onChange={(value) => setForm({ ...form, nombres: value })}
            />

            <Input
              label="Apellidos"
              value={form.apellidos}
              onChange={(value) => setForm({ ...form, apellidos: value })}
            />

            <Input
              label="Documento"
              value={form.documento}
              onChange={(value) => setForm({ ...form, documento: value })}
            />

            <Input
              label="Teléfono"
              value={form.telefono}
              onChange={(value) => setForm({ ...form, telefono: value })}
            />

            <Input
              label="Correo"
              value={form.correo}
              onChange={(value) => setForm({ ...form, correo: value })}
            />

            <Input
              label="Objetivo"
              value={form.objetivo}
              onChange={(value) => setForm({ ...form, objetivo: value })}
            />

            <Input
              label="Referido por"
              value={form.referidoPor}
              onChange={(value) => setForm({ ...form, referidoPor: value })}
            />

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Estado</span>

              <select
                value={form.estado}
                onChange={(event) =>
                  setForm({ ...form, estado: event.target.value as EstadoPersona })
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              >
                {estadoOptions.map((estado) => (
                  <option key={estado} value={estado}>
                    {estadoLabel(estado)}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-3">
              <button className="flex-1 rounded-2xl bg-slate-950 px-5 py-3 font-black text-white hover:bg-slate-800">
                {editingId ? 'Guardar cambios' : 'Crear persona'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-slate-200 px-5 py-3 font-black hover:bg-slate-50"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-black">Listado de personas</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Busca, selecciona o edita una persona.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar persona"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none sm:w-72"
                />

                <select
                  value={estadoFiltro}
                  onChange={(event) =>
                    setEstadoFiltro(event.target.value as 'todos' | EstadoPersona)
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                >
                  <option value="todos">Todos</option>

                  {estadoOptions.map((estado) => (
                    <option key={estado} value={estado}>
                      {estadoLabel(estado)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Persona</th>
                    <th className="px-4 py-3">Documento</th>
                    <th className="px-4 py-3">Objetivo</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {personasFiltradas.map((persona) => {
                    const selected = selectedPersona?.id === persona.id

                    return (
                      <tr
                        key={persona.id}
                        className={`border-t border-slate-100 ${
                          selected ? 'bg-slate-50' : ''
                        }`}
                      >
                        <td className="px-4 py-4">
                          <p className="font-black">
                            {persona.nombres} {persona.apellidos}
                          </p>
                          <p className="text-xs text-slate-500">{persona.correo}</p>
                        </td>

                        <td className="px-4 py-4">{persona.documento}</td>

                        <td className="px-4 py-4">{persona.objetivo}</td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${estadoBadgeClass(
                              persona.estado,
                            )}`}
                          >
                            {estadoLabel(persona.estado)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedId(persona.id)}
                              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black hover:bg-slate-50"
                            >
                              Ver
                            </button>

                            <button
                              type="button"
                              onClick={() => editarPersona(persona)}
                              className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white hover:bg-slate-800"
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {personasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                        No se encontraron personas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric title="Históricas" value={String(personasHistoricas)} />
            <Metric title="Constancias" value={String(constancias.length)} />
            <Metric title="Pagos registrados" value={String(movimientos.length)} />
            <Metric title="Medidas" value={String(medidas.length)} />
          </section>
        </section>
      </section>
	        {selectedPersona ? (
        <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <section className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <p className="text-sm font-bold text-slate-500">Perfil seleccionado</p>

                  <h2 className="mt-2 text-3xl font-black">
                    {selectedPersona.nombres} {selectedPersona.apellidos}
                  </h2>

                  <p className="mt-2 text-slate-500">{selectedPersona.objetivo}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${estadoBadgeClass(
                        selectedPersona.estado,
                      )}`}
                    >
                      {estadoLabel(selectedPersona.estado)}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                      Documento {selectedPersona.documento}
                    </span>
                  </div>
                </div>

                <select
                  value={selectedPersona.estado}
                  onChange={(event) =>
                    onChangeEstado(selectedPersona.id, event.target.value as EstadoPersona)
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                >
                  {estadoOptions.map((estado) => (
                    <option key={estado} value={estado}>
                      {estadoLabel(estado)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ProfileCard label="Constancias" value={String(constanciasPersona.length)} />
                <ProfileCard label="Racha" value={`${racha} días`} />
                <ProfileCard label="Total pagado" value={formatMoney(totalPagado)} />
                <ProfileCard
                  label="Peso actual"
                  value={ultimaMedida ? `${ultimaMedida.pesoKg} kg` : 'Sin medida'}
                />
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-2xl font-black">Registrar medida corporal</h2>

              <p className="mt-1 text-sm text-slate-500">
                Guarda el progreso físico de la persona seleccionada.
              </p>

              <form onSubmit={guardarMedida} className="mt-6 grid gap-4 md:grid-cols-3">
                <Input
                  label="Peso kg"
                  value={medidaForm.pesoKg}
                  onChange={(value) => setMedidaForm({ ...medidaForm, pesoKg: value })}
                  type="number"
                />

                <Input
                  label="Estatura cm"
                  value={medidaForm.estaturaCm}
                  onChange={(value) => setMedidaForm({ ...medidaForm, estaturaCm: value })}
                  type="number"
                />

                <Input
                  label="Cintura cm"
                  value={medidaForm.cinturaCm}
                  onChange={(value) => setMedidaForm({ ...medidaForm, cinturaCm: value })}
                  type="number"
                />

                <Input
                  label="Pecho cm"
                  value={medidaForm.pechoCm}
                  onChange={(value) => setMedidaForm({ ...medidaForm, pechoCm: value })}
                  type="number"
                />

                <Input
                  label="Brazo cm"
                  value={medidaForm.brazoCm}
                  onChange={(value) => setMedidaForm({ ...medidaForm, brazoCm: value })}
                  type="number"
                />

                <Input
                  label="Pierna cm"
                  value={medidaForm.piernaCm}
                  onChange={(value) => setMedidaForm({ ...medidaForm, piernaCm: value })}
                  type="number"
                />

                <div className="md:col-span-3">
                  <Input
                    label="Observación"
                    value={medidaForm.observacion}
                    onChange={(value) =>
                      setMedidaForm({ ...medidaForm, observacion: value })
                    }
                  />
                </div>

                <button className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white hover:bg-slate-800 md:col-span-3">
                  Guardar medida
                </button>
              </form>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-2xl font-black">Historial de medidas</h2>

              <div className="mt-5 grid gap-3">
                {medidasPersona.map((medida) => (
                  <div
                    key={medida.id}
                    className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-4"
                  >
                    <Line label="Fecha" value={formatDate(medida.fecha)} />
                    <Line label="Peso" value={`${medida.pesoKg} kg`} />
                    <Line label="Estatura" value={`${medida.estaturaCm} cm`} />
                    <Line
                      label="IMC"
                      value={calcularImc(medida.pesoKg, medida.estaturaCm)}
                    />
                  </div>
                ))}

                {medidasPersona.length === 0 && (
                  <Empty message="Esta persona todavía no tiene medidas registradas." />
                )}
              </div>
            </section>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-2xl font-black">Información</h2>

              <div className="mt-5 space-y-3">
                <Line label="Teléfono" value={selectedPersona.telefono || 'Sin teléfono'} />
                <Line label="Correo" value={selectedPersona.correo || 'Sin correo'} />
                <Line
                  label="Referido por"
                  value={selectedPersona.referidoPor || 'Sin referido'}
                />
                <Line label="Registro" value={formatDate(selectedPersona.fechaRegistro)} />
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-2xl font-black">Plan actual</h2>

              <div className="mt-5">
                {ultimoPlan ? (
                  <div className="space-y-3">
                    <Line label="Nombre" value={ultimoPlan.nombre} />
                    <Line label="Objetivo" value={ultimoPlan.objetivo} />
                    <Line label="Días" value={`${ultimoPlan.diasSemana} por semana`} />
                    <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                      {ultimoPlan.descripcion}
                    </p>
                  </div>
                ) : (
                  <Empty message="Esta persona todavía no tiene plan." />
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-2xl font-black">Bienestar reciente</h2>

              <div className="mt-5">
                {ultimoBienestar ? (
                  <div className="space-y-3">
                    <Line label="Estado" value={ultimoBienestar.estadoAnimo} />
                    <Line label="Energía" value={`${ultimoBienestar.energia}/10`} />
                    <Line label="Sueño" value={`${ultimoBienestar.horasSueno} horas`} />
                    <Line label="Agua" value={`${ultimoBienestar.vasosAgua} vasos`} />
                  </div>
                ) : (
                  <Empty message="Esta persona todavía no tiene registros de bienestar." />
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-2xl font-black">Pagos recientes</h2>

              <div className="mt-5 space-y-3">
                {movimientosPersona.slice(0, 5).map((movimiento) => (
                  <div key={movimiento.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-black">{movimiento.concepto}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(movimiento.fecha)} · {formatMoney(movimiento.valor)}
                    </p>
                  </div>
                ))}

                {movimientosPersona.length === 0 && (
                  <Empty message="Esta persona todavía no tiene pagos registrados." />
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-2xl font-black">Constancias recientes</h2>

              <div className="mt-5 space-y-3">
                {constanciasPersona.slice(0, 5).map((constancia) => (
                  <div key={constancia.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-black">{formatDate(constancia.fecha)}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Registrado por {constancia.registradoPor}
                    </p>
                  </div>
                ))}

                {constanciasPersona.length === 0 && (
                  <Empty message="Esta persona todavía no tiene constancias registradas." />
                )}
              </div>
            </section>
          </aside>
        </section>
      ) : (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm sm:p-10">
          Todavía no hay una persona seleccionada.
        </section>
      )}
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
      />
    </label>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
    </div>
  )
}

function ProfileCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 font-black text-slate-900">{value}</p>
    </div>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <span className="text-right text-sm font-black">{value}</span>
    </div>
  )
}

function Empty({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
      {message}
    </div>
  )
}

function calcularRacha(constancias: Constancia[]) {
  const fechas = new Set(constancias.map((constancia) => constancia.fecha.slice(0, 10)))

  let racha = 0
  const cursor = new Date()

  while (true) {
    const fecha = cursor.toISOString().slice(0, 10)

    if (!fechas.has(fecha)) {
      break
    }

    racha += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return racha
}

function calcularImc(pesoKg: number, estaturaCm: number) {
  const estaturaM = estaturaCm / 100

  if (estaturaM <= 0) return '-'

  return (pesoKg / (estaturaM * estaturaM)).toFixed(1)
}

function toOptionalNumber(value: string) {
  const numberValue = Number(value)

  if (!numberValue || numberValue <= 0) {
    return undefined
  }

  return numberValue
}

function estadoLabel(estado: EstadoPersona) {
  const labels: Record<EstadoPersona, string> = {
    activa: 'Activa',
    en_pausa: 'En pausa',
    registro: 'En registro',
    historica: 'Histórica',
  }

  return labels[estado]
}

function estadoBadgeClass(estado: EstadoPersona) {
  const classes: Record<EstadoPersona, string> = {
    activa: 'bg-emerald-50 text-emerald-700',
    en_pausa: 'bg-amber-50 text-amber-700',
    registro: 'bg-blue-50 text-blue-700',
    historica: 'bg-slate-100 text-slate-700',
  }

  return classes[estado]
}

function formatDate(date: string) {
  return new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}