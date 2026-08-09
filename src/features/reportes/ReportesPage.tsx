import { useMemo, useState } from 'react'
import { CalendarRange, Download, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import type { RegistroBienestar } from '@/shared/types/bienestar'
import type { MovimientoCaja, Servicio } from '@/shared/types/comercial'
import type { Constancia } from '@/shared/types/constancia'
import type { PlanEntrenamiento } from '@/shared/types/entrenamiento'
import type { Persona } from '@/shared/types/persona'
import type { MedidaCorporal } from '@/shared/types/progreso'
import type { MovimientoInventario, Producto } from '@/shared/types/tienda'

interface Props {
  personas: Persona[]
  constancias: Constancia[]
  movimientos: MovimientoCaja[]
  productos: Producto[]
  servicios: Servicio[]
  movimientosInventario: MovimientoInventario[]
  planes: PlanEntrenamiento[]
  registrosBienestar: RegistroBienestar[]
  medidas: MedidaCorporal[]
}

type RangoPreset = 'hoy' | 'semana' | 'mes' | 'todo'

const presets: { id: RangoPreset; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Últimos 7 días' },
  { id: 'mes', label: 'Últimos 30 días' },
  { id: 'todo', label: 'Todo' },
]

export function ReportesPage({
  personas,
  constancias,
  movimientos,
  productos,
  servicios,
  movimientosInventario,
  planes,
  registrosBienestar,
  medidas,
}: Props) {
  const hoy = new Date().toISOString().slice(0, 10)

  const [preset, setPreset] = useState<RangoPreset>('mes')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  // Fechas del rango efectivo
  const rango = useMemo(() => {
    if (fechaDesde && fechaHasta) {
      return { desde: fechaDesde, hasta: fechaHasta }
    }

    const hasta = hoy
    let desde = hoy

    if (preset === 'semana') {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      desde = d.toISOString().slice(0, 10)
    } else if (preset === 'mes') {
      const d = new Date()
      d.setDate(d.getDate() - 30)
      desde = d.toISOString().slice(0, 10)
    } else if (preset === 'todo') {
      desde = '0000-01-01'
    }

    return { desde, hasta }
  }, [preset, fechaDesde, fechaHasta, hoy])

  const enRango = (fecha: string) => {
    const f = fecha.slice(0, 10)
    return f >= rango.desde && f <= rango.hasta
  }

  // Movimientos filtrados por rango
  const movimientosRango = useMemo(
    () => movimientos.filter((m) => enRango(m.fecha)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [movimientos, rango],
  )

  const ingresosRango = movimientosRango
    .filter((m) => m.tipo === 'ingreso')
    .reduce((suma, m) => suma + m.valor, 0)

  const gastosRango = movimientosRango
    .filter((m) => m.tipo === 'gasto')
    .reduce((suma, m) => suma + m.valor, 0)

  const cajaNetaRango = ingresosRango - gastosRango

  // Ingresos por método de pago
  const ingresosPorMetodo = useMemo(() => {
    const mapa = new Map<string, number>()

    movimientosRango
      .filter((m) => m.tipo === 'ingreso')
      .forEach((m) => {
        const metodo = m.metodoPago || 'Sin método'
        mapa.set(metodo, (mapa.get(metodo) ?? 0) + m.valor)
      })

    return [...mapa.entries()]
      .map(([metodo, total]) => ({ metodo, total }))
      .sort((a, b) => b.total - a.total)
  }, [movimientosRango])

  // Ingresos por concepto
  const ingresosPorConcepto = useMemo(() => {
    const mapa = new Map<string, number>()

    movimientosRango
      .filter((m) => m.tipo === 'ingreso')
      .forEach((m) => {
        mapa.set(m.concepto, (mapa.get(m.concepto) ?? 0) + m.valor)
      })

    return [...mapa.entries()]
      .map(([concepto, total]) => ({ concepto, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
  }, [movimientosRango])

  // Personas nuevas en el rango
  const personasNuevas = useMemo(
    () =>
      personas
        .filter((p) => enRango(p.fechaRegistro))
        .sort((a, b) => b.fechaRegistro.localeCompare(a.fechaRegistro)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [personas, rango],
  )

  // Constancias en el rango
  const constanciasRango = useMemo(
    () => constancias.filter((c) => enRango(c.fecha)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [constancias, rango],
  )

  // Ventas de tienda en el rango (movimientos inventario tipo venta)
  const ventasTienda = useMemo(
    () => movimientosInventario.filter((m) => m.tipo === 'venta' && enRango(m.fecha)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [movimientosInventario, rango],
  )

  const unidadesVendidas = ventasTienda.reduce((suma, v) => suma + v.cantidad, 0)

  // Ingresos por persona (quién aporta más)
  const ingresosPorPersona = useMemo(() => {
    const mapa = new Map<string, number>()

    movimientosRango
      .filter((m) => m.tipo === 'ingreso' && m.personaId)
      .forEach((m) => {
        mapa.set(m.personaId!, (mapa.get(m.personaId!) ?? 0) + m.valor)
      })

    return [...mapa.entries()]
      .map(([personaId, total]) => {
        const persona = personas.find((p) => p.id === personaId)
        return {
          persona,
          total,
        }
      })
      .filter((item) => item.persona)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [movimientosRango, personas])

  // Totales generales (sin filtro)
  const ingresosTotales = movimientos
    .filter((m) => m.tipo === 'ingreso')
    .reduce((suma, m) => suma + m.valor, 0)

  const gastosTotales = movimientos
    .filter((m) => m.tipo === 'gasto')
    .reduce((suma, m) => suma + m.valor, 0)

  const cajaNetaTotal = ingresosTotales - gastosTotales

  const personasActivas = personas.filter((p) => p.estado === 'activa').length
  const personasRegistro = personas.filter((p) => p.estado === 'registro').length
  const personasPausa = personas.filter((p) => p.estado === 'en_pausa').length
  const personasHistoricas = personas.filter((p) => p.estado === 'historica').length

  const constanciasHoy = constancias.filter((c) => c.fecha.slice(0, 10) === hoy).length
  const porcentajeAsistencia =
    personasActivas > 0 ? Math.round((constanciasHoy / personasActivas) * 100) : 0

  const stockTotal = productos.reduce((suma, p) => suma + p.stock, 0)
  const productosBajoStock = productos.filter((p) => p.stock <= 3).length

  const valorInventarioVenta = productos.reduce(
    (suma, p) => suma + p.stock * p.precioVenta,
    0,
  )

  const valorInventarioCosto = productos.reduce((suma, p) => suma + p.stock * p.costo, 0)

  // Ranking de constancia
  const rankingConstancia = useMemo(() => {
    return personas
      .map((persona) => {
        const total = constancias.filter((c) => c.personaId === persona.id).length
        return { persona, total }
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [personas, constancias])

  // Planes de entrenamiento activos
  const planesActivos = planes.filter((p) => p.estado === 'activo').length
  const planesAprobados = planes.filter((p) => p.estado === 'aprobado').length
  const planesSugeridos = planes.filter((p) => p.estado === 'sugerido').length
  const planesFinalizados = planes.filter((p) => p.estado === 'finalizado').length

  // Registros de bienestar en el rango
  const bienestarRango = useMemo(
    () => registrosBienestar.filter((r) => enRango(r.fecha)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [registrosBienestar, rango],
  )

  const energiaPromedio =
    bienestarRango.length > 0
      ? Math.round(
          (bienestarRango.reduce((suma, r) => suma + r.energia, 0) / bienestarRango.length) *
            10,
        ) / 10
      : 0

  const suenoPromedio =
    bienestarRango.length > 0
      ? Math.round(
          (bienestarRango.reduce((suma, r) => suma + r.horasSueno, 0) /
            bienestarRango.length) *
            10,
        ) / 10
      : 0

  // Medidas registradas en el rango
  const medidasRango = useMemo(
    () => medidas.filter((m) => enRango(m.fecha)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [medidas, rango],
  )

  // Servicios activos
  const serviciosActivos = servicios.filter((s) => s.activo).length
  const serviciosInactivos = servicios.filter((s) => !s.activo).length
  const serviciosMembresia = servicios.filter((s) => s.tipo === 'membresia').length
  const serviciosPersonalizado = servicios.filter((s) => s.tipo === 'personalizado').length


  // Exportar CSV de movimientos del rango
  function exportarCSV() {
    const encabezados = ['Fecha', 'Tipo', 'Concepto', 'Valor', 'Método de pago', 'Observación']
    const filas = movimientosRango.map((m) => [
      m.fecha.slice(0, 10),
      m.tipo,
      m.concepto,
      String(m.valor),
      m.metodoPago || '',
      m.observacion || '',
    ])

    const csv = [encabezados, ...filas]
      .map((fila) => fila.map((celda) => `"${celda.replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reporte-caja-${rango.desde}-a-${rango.hasta}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const resumenEstados = [
    { label: 'Activas', value: personasActivas, total: personas.length },
    { label: 'En registro', value: personasRegistro, total: personas.length },
    { label: 'En pausa', value: personasPausa, total: personas.length },
    { label: 'Históricas', value: personasHistoricas, total: personas.length },
  ]

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-surface-800 bg-surface-950 p-6 text-white shadow-[0_20px_70px_-25px_rgba(28,25,23,0.35)] sm:p-8">
        <p className="text-sm text-surface-300">Reportes</p>

        <h1 className="mt-3 text-4xl font-black">Indicadores de ORIGEN</h1>

        <p className="mt-4 max-w-3xl text-surface-300">
          Consulta ingresos, gastos, ganancias y actividad del gimnasio filtrando por rango de
          fechas.
        </p>
      </section>

      {/* Filtro por rango de fechas */}
      <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white">
              <CalendarRange size={20} />
            </div>

            <div>
              <h2 className="text-xl font-black">Filtrar por fechas</h2>
              <p className="text-sm text-surface-500">
                Consulta ingresos y ganancias de un período específico.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={exportarCSV}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-700"
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPreset(p.id)
                setFechaDesde('')
                setFechaHasta('')
              }}
              className={`rounded-2xl px-4 py-2.5 text-sm font-black transition ${
                preset === p.id && !fechaDesde && !fechaHasta
                  ? 'bg-brand-600 text-white'
                  : 'border border-surface-200 bg-white text-surface-600 hover:bg-surface-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:max-w-xl">
          <label className="block">
            <span className="text-sm font-bold text-surface-700">Desde</span>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => {
                setFechaDesde(e.target.value)
                setPreset('todo')
              }}
              className="mt-1 w-full rounded-2xl border border-surface-200 px-4 py-3 outline-none transition focus:border-brand-600"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-surface-700">Hasta</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => {
                setFechaHasta(e.target.value)
                setPreset('todo')
              }}
              className="mt-1 w-full rounded-2xl border border-surface-200 px-4 py-3 outline-none transition focus:border-brand-600"
            />
          </label>
        </div>

        <p className="mt-4 rounded-2xl bg-surface-50 px-4 py-3 text-sm font-bold text-surface-600">
          Período consultado:{' '}
          <span className="text-surface-950">
            {formatDate(rango.desde)} — {formatDate(rango.hasta)}
          </span>
        </p>
      </section>


      {/* Métricas del período */}
      <section className="grid gap-4 md:grid-cols-4">
        <Metric
          title="Ingresos del período"
          value={formatMoney(ingresosRango)}
          icon={<TrendingUp size={18} />}
          tone="emerald"
        />
        <Metric
          title="Gastos del período"
          value={formatMoney(gastosRango)}
          icon={<TrendingDown size={18} />}
          tone="rose"
        />
        <Metric
          title="Ganancia neta"
          value={formatMoney(cajaNetaRango)}
          icon={<Wallet size={18} />}
          tone={cajaNetaRango >= 0 ? 'emerald' : 'rose'}
        />
        <Metric
          title="Movimientos"
          value={String(movimientosRango.length)}
          icon={<CalendarRange size={18} />}
          tone="slate"
        />
      </section>

      {/* Ingresos por método de pago y concepto */}
      <section className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-2xl font-black">Ingresos por método de pago</h2>

          <p className="mt-1 text-sm text-surface-500">
            Cómo se recibieron los pagos en el período.
          </p>

          <div className="mt-5 space-y-3">
            {ingresosPorMetodo.length === 0 ? (
              <Empty message="No hay ingresos en este período." />
            ) : (
              ingresosPorMetodo.map((item) => {
                const percent =
                  ingresosRango > 0 ? Math.round((item.total / ingresosRango) * 100) : 0

                return (
                  <div key={item.metodo}>
                    <div className="mb-1 flex items-center justify-between gap-4">
                      <span className="text-sm font-black text-surface-700">{item.metodo}</span>
                      <span className="text-sm font-black text-surface-500">
                        {formatMoney(item.total)} · {percent}%
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-surface-100">
                      <div
                        className="h-full rounded-full bg-success-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-2xl font-black">Ingresos por concepto</h2>

          <p className="mt-1 text-sm text-surface-500">
            Los conceptos que más generaron ingresos en el período.
          </p>

          <div className="mt-5 space-y-3">
            {ingresosPorConcepto.length === 0 ? (
              <Empty message="No hay ingresos en este período." />
            ) : (
              ingresosPorConcepto.map((item) => (
                <div
                  key={item.concepto}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-surface-50 px-4 py-3"
                >
                  <span className="text-sm font-black text-surface-700">{item.concepto}</span>
                  <span className="text-sm font-black text-success-700">
                    {formatMoney(item.total)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </section>


      {/* Personas nuevas y ranking de aportes */}
      <section className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-2xl font-black">Personas nuevas en el período</h2>

          <p className="mt-1 text-sm text-surface-500">
            Registros de personas creados entre {formatDate(rango.desde)} y{' '}
            {formatDate(rango.hasta)}.
          </p>

          <div className="mt-5 space-y-3">
            {personasNuevas.length === 0 ? (
              <Empty message="No se registraron personas nuevas en este período." />
            ) : (
              personasNuevas.map((persona) => (
                <div
                  key={persona.id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-surface-50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-black">
                      {persona.nombres} {persona.apellidos}
                    </p>
                    <p className="text-xs text-surface-500">{persona.documento}</p>
                  </div>

                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-surface-700">
                    {formatDate(persona.fechaRegistro)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-2xl font-black">Personas que más aportan</h2>

          <p className="mt-1 text-sm text-surface-500">
            Quiénes generaron más ingresos en el período.
          </p>

          <div className="mt-5 space-y-3">
            {ingresosPorPersona.length === 0 ? (
              <Empty message="No hay ingresos asociados a personas en este período." />
            ) : (
              ingresosPorPersona.map((item, index) => (
                <div
                  key={item.persona!.id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-surface-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-black text-white">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-black">
                        {item.persona!.nombres} {item.persona!.apellidos}
                      </p>
                      <p className="text-xs text-surface-500">{item.persona!.objetivo}</p>
                    </div>
                  </div>

                  <span className="shrink-0 text-sm font-black text-success-700">
                    {formatMoney(item.total)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </section>


      {/* Actividad del período */}
      <section className="grid gap-4 md:grid-cols-4">
        <Metric title="Constancias en período" value={String(constanciasRango.length)} />
        <Metric title="Personas nuevas" value={String(personasNuevas.length)} />
        <Metric title="Ventas tienda" value={String(ventasTienda.length)} />
        <Metric title="Unidades vendidas" value={String(unidadesVendidas)} />
      </section>

      {/* Entrenamiento, bienestar y servicios */}
      <section className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-2xl font-black">Planes de entrenamiento</h2>

          <p className="mt-1 text-sm text-surface-500">
            Estado actual de los planes asignados.
          </p>

          <div className="mt-5 space-y-3">
            <Line label="Activos" value={String(planesActivos)} />
            <Line label="Aprobados" value={String(planesAprobados)} />
            <Line label="Sugeridos" value={String(planesSugeridos)} />
            <Line label="Finalizados" value={String(planesFinalizados)} />
            <Line label="Total planes" value={String(planes.length)} />
          </div>
        </section>

        <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-2xl font-black">Bienestar en el período</h2>

          <p className="mt-1 text-sm text-surface-500">
            Registros de bienestar entre {formatDate(rango.desde)} y {formatDate(rango.hasta)}.
          </p>

          <div className="mt-5 space-y-3">
            <Line label="Registros" value={String(bienestarRango.length)} />
            <Line label="Energía promedio" value={`${energiaPromedio}/10`} />
            <Line label="Sueño promedio" value={`${suenoPromedio} h`} />
            <Line label="Medidas registradas" value={String(medidasRango.length)} />
          </div>
        </section>

        <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-2xl font-black">Servicios</h2>

          <p className="mt-1 text-sm text-surface-500">
            Catálogo de servicios del gimnasio.
          </p>

          <div className="mt-5 space-y-3">
            <Line label="Activos" value={String(serviciosActivos)} />
            <Line label="Inactivos" value={String(serviciosInactivos)} />
            <Line label="Membresías" value={String(serviciosMembresia)} />
            <Line label="Personalizados" value={String(serviciosPersonalizado)} />
            <Line label="Total servicios" value={String(servicios.length)} />
          </div>
        </section>
      </section>


      {/* Movimientos del período */}
      <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-black">Movimientos del período</h2>

        <p className="mt-1 text-sm text-surface-500">
          Todos los ingresos y gastos registrados entre {formatDate(rango.desde)} y{' '}
          {formatDate(rango.hasta)}.
        </p>

        <div className="mt-6">
          {/* Tabla en desktop */}
          <div className="hidden overflow-hidden rounded-2xl border border-surface-200 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-50 text-surface-500">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Concepto</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Método</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                </tr>
              </thead>

              <tbody>
                {movimientosRango.map((movimiento) => (
                  <tr key={movimiento.id} className="border-t border-surface-100">
                    <td className="px-4 py-4">{formatDate(movimiento.fecha)}</td>

                    <td className="px-4 py-4">
                      <p className="font-black">{movimiento.concepto}</p>
                      {movimiento.observacion && (
                        <p className="text-xs text-surface-500">{movimiento.observacion}</p>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          movimiento.tipo === 'ingreso'
                            ? 'bg-success-50 text-success-700'
                            : 'bg-danger-50 text-danger-700'
                        }`}
                      >
                        {movimiento.tipo}
                      </span>
                    </td>

                    <td className="px-4 py-4">{movimiento.metodoPago || 'Sin método'}</td>

                    <td
                      className={`px-4 py-4 text-right font-black ${
                        movimiento.tipo === 'ingreso' ? 'text-success-700' : 'text-danger-700'
                      }`}
                    >
                      {movimiento.tipo === 'ingreso' ? '+' : '-'}
                      {formatMoney(movimiento.valor)}
                    </td>
                  </tr>
                ))}

                {movimientosRango.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-surface-500">
                      No hay movimientos en este período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tarjetas en móvil */}
          <div className="space-y-3 md:hidden">
            {movimientosRango.map((movimiento) => (
              <article
                key={movimiento.id}
                className="rounded-[1.5rem] border border-surface-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black text-surface-900">{movimiento.concepto}</p>
                    <p className="mt-0.5 text-xs text-surface-500">
                      {formatDate(movimiento.fecha)} · {movimiento.metodoPago || 'Sin método'}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                      movimiento.tipo === 'ingreso'
                        ? 'bg-success-50 text-success-700'
                        : 'bg-danger-50 text-danger-700'
                    }`}
                  >
                    {movimiento.tipo}
                  </span>
                </div>

                <p
                  className={`mt-3 text-right font-black ${
                    movimiento.tipo === 'ingreso' ? 'text-success-700' : 'text-danger-700'
                  }`}
                >
                  {movimiento.tipo === 'ingreso' ? '+' : '-'}
                  {formatMoney(movimiento.valor)}
                </p>
              </article>
            ))}

            {movimientosRango.length === 0 && (
              <div className="rounded-2xl border border-dashed border-surface-300 p-8 text-center text-surface-500">
                No hay movimientos en este período.
              </div>
            )}
          </div>
        </div>
      </section>


      {/* Resumen general del sistema */}
      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="space-y-6">
          <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black">Estado de personas</h2>

            <p className="mt-1 text-sm text-surface-500">
              Distribución actual de personas según su estado.
            </p>

            <div className="mt-6 space-y-4">
              {resumenEstados.map((item) => (
                <Progress
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  total={item.total}
                />
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black">Ranking de constancia</h2>

            <p className="mt-1 text-sm text-surface-500">
              Personas con mayor número de constancias registradas.
            </p>

            <div className="mt-6 space-y-3">
              {rankingConstancia.map((item, index) => (
                <div
                  key={item.persona.id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-surface-50 px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-black text-white">
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-black">
                        {item.persona.nombres} {item.persona.apellidos}
                      </p>
                      <p className="text-xs text-surface-500">{item.persona.objetivo}</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-surface-700">
                    {item.total} constancias
                  </span>
                </div>
              ))}

              {rankingConstancia.length === 0 && (
                <Empty message="Todavía no hay información de constancia." />
              )}
            </div>
          </section>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black">Resumen financiero total</h2>

            <div className="mt-5 space-y-3">
              <Line label="Ingresos totales" value={formatMoney(ingresosTotales)} />
              <Line label="Gastos totales" value={formatMoney(gastosTotales)} />
              <Line label="Caja neta total" value={formatMoney(cajaNetaTotal)} />
            </div>
          </section>

          <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black">Inventario</h2>

            <div className="mt-5 space-y-3">
              <Line label="Productos" value={String(productos.length)} />
              <Line label="Stock total" value={String(stockTotal)} />
              <Line label="Bajo stock" value={String(productosBajoStock)} />
              <Line label="Valor venta" value={formatMoney(valorInventarioVenta)} />
              <Line label="Valor costo" value={formatMoney(valorInventarioCosto)} />
              <Line
                label="Margen estimado"
                value={formatMoney(valorInventarioVenta - valorInventarioCosto)}
              />
            </div>
          </section>

          <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black">Constancia</h2>

            <div className="mt-5 space-y-3">
              <Line label="Personas activas" value={String(personasActivas)} />
              <Line label="Constancias hoy" value={String(constanciasHoy)} />
              <Line label="Asistencia hoy" value={`${porcentajeAsistencia}%`} />
              <Line label="Total constancias" value={String(constancias.length)} />
            </div>
          </section>

          <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-2xl font-black">Lectura rápida</h2>

            <div className="mt-5 rounded-2xl bg-surface-50 p-5 text-sm leading-6 text-surface-600">
              <p>
                En el período consultado se registraron{' '}
                <strong>{formatMoney(ingresosRango)}</strong> en ingresos y{' '}
                <strong>{formatMoney(gastosRango)}</strong> en gastos, para una ganancia neta de{' '}
                <strong>{formatMoney(cajaNetaRango)}</strong>.
              </p>

              <p className="mt-3">
                Se registraron <strong>{personasNuevas.length}</strong> personas nuevas y{' '}
                <strong>{constanciasRango.length}</strong> constancias en el período.
              </p>
            </div>
          </section>
        </aside>
      </section>

    </div>
  )
}

function Metric({
  title,
  value,
  icon,
  tone = 'slate',
}: {
  title: string
  value: string
  icon?: React.ReactNode
  tone?: 'slate' | 'emerald' | 'rose'
}) {
  const toneClasses: Record<string, string> = {
    slate: 'bg-surface-950 text-white',
    emerald: 'bg-success-600 text-white',
    rose: 'bg-danger-600 text-white',
  }

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-surface-500">{title}</p>
        {icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
            {icon}
          </span>
        )}
      </div>

      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  )
}

function Progress({
  label,
  value,
  total,
}: {
  label: string
  value: number
  total: number
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm font-black text-surface-700">{label}</span>
        <span className="text-sm font-black text-surface-500">
          {value} / {total}
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-surface-100">
        <div className="h-full rounded-full bg-brand-600" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface-50 px-4 py-3">
      <span className="text-sm font-bold text-surface-600">{label}</span>
      <span className="text-right text-sm font-black">{value}</span>
    </div>
  )
}

function Empty({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-surface-300 p-6 text-center text-sm text-surface-500">
      {message}
    </div>
  )
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
 