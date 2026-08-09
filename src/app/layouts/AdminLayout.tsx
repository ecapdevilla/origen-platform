import { useEffect, useState } from 'react'
import {
  BarChart3,
  CalendarCheck,
  Dumbbell,
  Heart,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  MoreHorizontal,
  Settings,
  Store,
  Users,
  Wallet,
  X,
} from 'lucide-react'

import { AdminDashboard } from '@/features/admin/AdminDashboard'
import {
  crearRegistroBienestarSupabase,
  listarRegistrosBienestar,
} from '@/features/bienestar/bienestarApi'
import { BienestarPage } from '@/features/bienestar/BienestarPage'
import {
  crearMovimientoCajaSupabase,
  crearServicioSupabase,
  listarMovimientosCaja,
  listarServicios,
} from '@/features/comercial/comercialApi'
import { ComercialPage } from '@/features/comercial/ComercialPage'
import {
  actualizarConfiguracionGimnasio,
  obtenerConfiguracionGimnasio,
} from '@/features/configuracion/configuracionApi'
import { ConfiguracionPage } from '@/features/configuracion/ConfiguracionPage'
import {
  crearConstanciaSupabase,
  listarConstancias,
} from '@/features/constancia/constanciasApi'
import { ConstanciaPage } from '@/features/constancia/ConstanciaPage'
import {
  crearPlanEntrenamientoSupabase,
  listarPlanesEntrenamiento,
} from '@/features/entrenamiento/entrenamientoApi'
import { EntrenamientoPage } from '@/features/entrenamiento/EntrenamientoPage'
import {
  crearMedidaCorporalSupabase,
  listarMedidasCorporales,
} from '@/features/personas/medidasApi'
import { PersonasPage } from '@/features/personas/PersonasPage'
import {
  actualizarPersonaSupabase,
  cambiarEstadoPersonaSupabase,
  crearPersonaSupabase,
  listarPersonas,
} from '@/features/personas/personasApi'
import { ReportesPage } from '@/features/reportes/ReportesPage'
import {
  actualizarProductoSupabase,
  crearMovimientoInventarioSupabase,
  crearProductoSupabase,
  listarMovimientosInventario,
  listarProductos,
} from '@/features/tienda/tiendaApi'
import { TiendaPage } from '@/features/tienda/TiendaPage'
import {
  actualizarUsuarioSistemaSupabase,
  cambiarEstadoUsuarioSistemaSupabase,
  crearUsuarioSistemaSupabase,
  listarUsuariosSistema,
} from '@/features/usuarios/usuariosApi'
import { UsuariosPage } from '@/features/usuarios/UsuariosPage'
import { cargarDatosDemoOrigen, obtenerDatosDemoOrigen } from '@/shared/lib/demoData'
import type { SesionUsuario } from '@/shared/types/auth'
import type { RegistroBienestar } from '@/shared/types/bienestar'
import type { MovimientoCaja, Servicio } from '@/shared/types/comercial'
import type { ConfiguracionGimnasio } from '@/shared/types/configuracion'
import type { Constancia } from '@/shared/types/constancia'
import type { PlanEntrenamiento } from '@/shared/types/entrenamiento'
import type { EstadoPersona, Persona } from '@/shared/types/persona'
import type { MedidaCorporal } from '@/shared/types/progreso'
import type { MovimientoInventario, Producto } from '@/shared/types/tienda'
import type {
  CrearUsuarioSistemaInput,
  UsuarioSistema,
} from '@/shared/types/usuario'

interface Props {
  usuario: SesionUsuario
  onLogout: () => void
}

type AdminPage =
  | 'dashboard'
  | 'personas'
  | 'constancia'
  | 'comercial'
  | 'tienda'
  | 'entrenamiento'
  | 'bienestar'
  | 'usuarios'
  | 'reportes'
  | 'configuracion'

const defaultConfiguracion: ConfiguracionGimnasio = {
  nombre: 'ORIGEN',
  lema: 'Cada persona importa. Cada hábito cuenta. Cada logro merece ser celebrado.',
  telefono: '3000000000',
  direccion: 'Barranquilla, Colombia',
  terminoPersonas: 'Personas',
  tono: 'Cercano',
}

const navigation: { id: AdminPage; label: string; description: string }[] = [
  {
    id: 'dashboard',
    label: 'Inicio',
    description: 'Resumen general',
  },
  {
    id: 'personas',
    label: 'Personas',
    description: 'Miembros y perfiles',
  },
  {
    id: 'constancia',
    label: 'Constancia',
    description: 'Asistencia diaria',
  },
  {
    id: 'entrenamiento',
    label: 'Entrenamiento',
    description: 'Planes y rutinas',
  },
  {
    id: 'bienestar',
    label: 'Bienestar',
    description: 'Energía y hábitos',
  },
  {
    id: 'comercial',
    label: 'Comercial',
    description: 'Servicios y caja',
  },
  {
    id: 'tienda',
    label: 'Tienda',
    description: 'Productos e inventario',
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    description: 'Roles y accesos',
  },
  {
    id: 'reportes',
    label: 'Reportes',
    description: 'Indicadores',
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    description: 'Datos del gimnasio',
  },
]

// Secciones principales que van en la barra inferior de móvil
const primaryNav: AdminPage[] = ['dashboard', 'personas', 'constancia', 'comercial', 'tienda']

const navIcons: Record<AdminPage, React.ElementType> = {

  dashboard: Home,
  personas: Users,
  constancia: CalendarCheck,
  comercial: Wallet,
  tienda: Store,
  entrenamiento: Dumbbell,
  bienestar: Heart,
  usuarios: LayoutGrid,
  reportes: BarChart3,
  configuracion: Settings,
}

export function AdminLayout({ usuario, onLogout }: Props) {
  const [activePage, setActivePage] = useState<AdminPage>('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [personas, setPersonas] = useState<Persona[]>([])
  const [constancias, setConstancias] = useState<Constancia[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [movimientosInventario, setMovimientosInventario] = useState<
    MovimientoInventario[]
  >([])
  const [planes, setPlanes] = useState<PlanEntrenamiento[]>([])
  const [registrosBienestar, setRegistrosBienestar] = useState<RegistroBienestar[]>([])
  const [configuracion, setConfiguracion] =
    useState<ConfiguracionGimnasio>(defaultConfiguracion)
  const [medidas, setMedidas] = useState<MedidaCorporal[]>([])
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([])

  useEffect(() => {
    let mounted = true

    async function cargarDatosDesdeSupabase() {
      try {
        setLoading(true)

        try {
          const [
            personasData,
            constanciasData,
            serviciosData,
            movimientosData,
            productosData,
            movimientosInventarioData,
            planesData,
            bienestarData,
            medidasData,
            configuracionData,
            usuariosData,
          ] = await Promise.all([
            listarPersonas(),
            listarConstancias(),
            listarServicios(),
            listarMovimientosCaja(),
            listarProductos(),
            listarMovimientosInventario(),
            listarPlanesEntrenamiento(),
            listarRegistrosBienestar(),
            listarMedidasCorporales(),
            obtenerConfiguracionGimnasio(),
            listarUsuariosSistema(),
          ])

          if (!mounted) return

          setPersonas(personasData)
          setConstancias(constanciasData)
          setServicios(serviciosData)
          setMovimientos(movimientosData)
          setProductos(productosData)
          setMovimientosInventario(movimientosInventarioData)
          setPlanes(planesData)
          setRegistrosBienestar(bienestarData)
          setMedidas(medidasData)
          setConfiguracion(configuracionData)
          setUsuarios(usuariosData)
        } catch (supabaseError) {
          console.warn('Supabase no disponible, usando datos demo:', supabaseError)

          cargarDatosDemoOrigen()

          const datosDemo = obtenerDatosDemoOrigen()

          if (!mounted) return

          setPersonas(datosDemo.personas)
          setConstancias(datosDemo.constancias)
          setServicios(datosDemo.servicios)
          setMovimientos(datosDemo.movimientos)
          setProductos(datosDemo.productos)
          setMovimientosInventario(datosDemo.movimientosInventario)
          setPlanes(datosDemo.planes)
          setRegistrosBienestar(datosDemo.bienestar)
          setMedidas(datosDemo.medidas)
          setConfiguracion(defaultConfiguracion)
          setUsuarios([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    cargarDatosDesdeSupabase()

    return () => {
      mounted = false
    }
  }, [])

  async function createPersona(persona: Persona) {
    try {
      const nuevaPersona = await crearPersonaSupabase(persona)

      setPersonas((current) =>
        [nuevaPersona, ...current].sort((a, b) => a.nombres.localeCompare(b.nombres)),
      )
    } catch (error) {
      console.error('Error creando persona en Supabase:', error)
      alert('No se pudo crear la persona en Supabase.')
    }
  }

  async function updatePersona(persona: Persona) {
    try {
      const personaActualizada = await actualizarPersonaSupabase(persona)

      setPersonas((current) =>
        current.map((item) =>
          item.id === personaActualizada.id ? personaActualizada : item,
        ),
      )
    } catch (error) {
      console.error('Error actualizando persona en Supabase:', error)
      alert('No se pudo actualizar la persona en Supabase.')
    }
  }

  async function changeEstado(personaId: string, estado: EstadoPersona) {
    try {
      await cambiarEstadoPersonaSupabase(personaId, estado)

      setPersonas((current) =>
        current.map((persona) =>
          persona.id === personaId
            ? {
                ...persona,
                estado,
              }
            : persona,
        ),
      )
    } catch (error) {
      console.error('Error cambiando estado de persona en Supabase:', error)
      alert('No se pudo cambiar el estado de la persona en Supabase.')
    }
  }

  async function marcarConstancia(personaId: string) {
    const hoy = new Date().toISOString().slice(0, 10)

    const yaExiste = constancias.some(
      (constancia) =>
        constancia.personaId === personaId && constancia.fecha.slice(0, 10) === hoy,
    )

    if (yaExiste) {
      alert('Esta persona ya tiene constancia marcada hoy.')
      return
    }

    try {
      const nuevaConstancia = await crearConstanciaSupabase(personaId, 'admin')

      setConstancias((current) => [nuevaConstancia, ...current])
    } catch (error) {
      console.error('Error marcando constancia en Supabase:', error)
      alert('No se pudo marcar la constancia en Supabase.')
    }
  }

  async function createServicio(servicio: Servicio) {
    try {
      const nuevoServicio = await crearServicioSupabase(servicio)

      setServicios((current) => [nuevoServicio, ...current])
    } catch (error) {
      console.error('Error creando servicio en Supabase:', error)
      alert('No se pudo crear el servicio en Supabase.')
    }
  }

  async function createMovimiento(movimiento: MovimientoCaja) {
    try {
      const nuevoMovimiento = await crearMovimientoCajaSupabase(movimiento)

      setMovimientos((current) => [nuevoMovimiento, ...current])
    } catch (error) {
      console.error('Error creando movimiento de caja en Supabase:', error)
      alert('No se pudo crear el movimiento de caja en Supabase.')
    }
  }

  async function marcarPago(persona: Persona) {
    const hoy = new Date().toISOString()

    const movimiento: MovimientoCaja = {
      id: crypto.randomUUID(),
      tipo: 'ingreso',
      concepto: `Pago de ${persona.nombres} ${persona.apellidos}`,
      valor: 0,
      fecha: hoy,
      personaId: persona.id,
      metodoPago: 'Efectivo',
      observacion: 'Pago marcado desde el módulo de personas',
    }

    await createMovimiento(movimiento)
  }


  async function createProducto(producto: Producto) {
    try {
      const nuevoProducto = await crearProductoSupabase(producto)

      setProductos((current) =>
        [nuevoProducto, ...current].sort((a, b) => a.nombre.localeCompare(b.nombre)),
      )
    } catch (error) {
      console.error('Error creando producto en Supabase:', error)
      alert('No se pudo crear el producto en Supabase.')
    }
  }

  async function updateProducto(producto: Producto) {
    try {
      const productoActualizado = await actualizarProductoSupabase(producto)

      setProductos((current) =>
        current.map((item) =>
          item.id === productoActualizado.id ? productoActualizado : item,
        ),
      )
    } catch (error) {
      console.error('Error actualizando producto en Supabase:', error)
      alert('No se pudo actualizar el producto en Supabase.')
    }
  }

  async function createMovimientoInventario(movimiento: MovimientoInventario) {
    try {
      const nuevoMovimiento = await crearMovimientoInventarioSupabase(movimiento)

      setMovimientosInventario((current) => [nuevoMovimiento, ...current])
    } catch (error) {
      console.error('Error creando movimiento de inventario en Supabase:', error)
      alert('No se pudo crear el movimiento de inventario en Supabase.')
    }
  }

  async function createPlan(plan: PlanEntrenamiento) {
    try {
      const nuevoPlan = await crearPlanEntrenamientoSupabase(plan)

      setPlanes((current) => [nuevoPlan, ...current])
    } catch (error) {
      console.error('Error creando plan en Supabase:', error)
      alert('No se pudo crear el plan en Supabase.')
    }
  }

  async function createRegistroBienestar(registro: RegistroBienestar) {
    try {
      const nuevoRegistro = await crearRegistroBienestarSupabase(registro)

      setRegistrosBienestar((current) => [nuevoRegistro, ...current])
    } catch (error) {
      console.error('Error creando registro de bienestar en Supabase:', error)
      alert('No se pudo crear el registro de bienestar en Supabase.')
    }
  }

  async function createMedida(medida: MedidaCorporal) {
    try {
      const nuevaMedida = await crearMedidaCorporalSupabase(medida)

      setMedidas((current) => [nuevaMedida, ...current])
    } catch (error) {
      console.error('Error creando medida corporal en Supabase:', error)
      alert('No se pudo crear la medida corporal en Supabase.')
    }
  }

  async function updateConfiguracion(configuracionActualizada: ConfiguracionGimnasio) {
    try {
      const nuevaConfiguracion = await actualizarConfiguracionGimnasio(
        configuracionActualizada,
      )

      setConfiguracion(nuevaConfiguracion)
    } catch (error) {
      console.error('Error actualizando configuración en Supabase:', error)
      alert('No se pudo actualizar la configuración en Supabase.')
    }
  }

  async function createUsuario(usuarioNuevo: CrearUsuarioSistemaInput) {
    try {
      const nuevoUsuario = await crearUsuarioSistemaSupabase(usuarioNuevo)

      setUsuarios((current) => [nuevoUsuario, ...current])
    } catch (error) {
      console.error('Error creando usuario en Supabase:', error)
      alert('No se pudo crear el usuario.')
    }
  }

  async function updateUsuario(usuarioActualizadoInput: UsuarioSistema) {
    try {
      const usuarioActualizado = await actualizarUsuarioSistemaSupabase(
        usuarioActualizadoInput,
      )

      setUsuarios((current) =>
        current.map((item) =>
          item.id === usuarioActualizado.id ? usuarioActualizado : item,
        ),
      )
    } catch (error) {
      console.error('Error actualizando usuario en Supabase:', error)
      alert('No se pudo actualizar el usuario.')
    }
  }

  async function changeEstadoUsuario(usuarioId: string, activo: boolean) {
    try {
      await cambiarEstadoUsuarioSistemaSupabase(usuarioId, activo)

      setUsuarios((current) =>
        current.map((item) =>
          item.id === usuarioId
            ? {
                ...item,
                activo,
              }
            : item,
        ),
      )
    } catch (error) {
      console.error('Error cambiando estado del usuario:', error)
      alert('No se pudo cambiar el estado del usuario.')
    }
  }

  function navigate(page: AdminPage) {
    setActivePage(page)
    setMobileMenuOpen(false)
  }

  function renderPage() {
    if (activePage === 'dashboard') {
      return (
        <AdminDashboard
          personas={personas}
          constancias={constancias}
          movimientos={movimientos}
          productos={productos}
          onGoPersonas={() => setActivePage('personas')}
        />
      )
    }

    if (activePage === 'personas') {
      return (
        <PersonasPage
          personas={personas}
          constancias={constancias}
          movimientos={movimientos}
          planes={planes}
          registrosBienestar={registrosBienestar}
          medidas={medidas}
          onCreatePersona={createPersona}
          onUpdatePersona={updatePersona}
          onChangeEstado={changeEstado}
          onCreateMedida={createMedida}
          onMarcarPago={marcarPago}
        />

      )
    }

    if (activePage === 'constancia') {
      return (
        <ConstanciaPage
          personas={personas}
          constancias={constancias}
          onMarcarConstancia={marcarConstancia}
        />
      )
    }

    if (activePage === 'entrenamiento') {
      return (
        <EntrenamientoPage
          personas={personas}
          planes={planes}
          onCreatePlan={createPlan}
        />
      )
    }

    if (activePage === 'bienestar') {
      return (
        <BienestarPage
          personas={personas}
          registros={registrosBienestar}
          onCreateRegistro={createRegistroBienestar}
        />
      )
    }

    if (activePage === 'comercial') {
      return (
        <ComercialPage
          personas={personas}
          servicios={servicios}
          movimientos={movimientos}
          onCreateServicio={createServicio}
          onCreateMovimiento={createMovimiento}
        />
      )
    }

    if (activePage === 'tienda') {
      return (
        <TiendaPage
          productos={productos}
          movimientosInventario={movimientosInventario}
          onCreateProducto={createProducto}
          onUpdateProducto={updateProducto}
          onCreateMovimientoInventario={createMovimientoInventario}
          onCreateMovimientoCaja={createMovimiento}
        />
      )
    }

    if (activePage === 'usuarios') {
      return (
        <UsuariosPage
          usuarios={usuarios}
          personas={personas}
          onCreateUsuario={createUsuario}
          onUpdateUsuario={updateUsuario}
          onChangeEstado={changeEstadoUsuario}
        />
      )
    }

    if (activePage === 'reportes') {
      return (
        <ReportesPage
          personas={personas}
          constancias={constancias}
          movimientos={movimientos}
          productos={productos}
          servicios={servicios}
          movimientosInventario={movimientosInventario}
          planes={planes}
          registrosBienestar={registrosBienestar}
          medidas={medidas}
        />
      )
    }

    return (
      <ConfiguracionPage
        configuracion={configuracion}
        onUpdateConfiguracion={updateConfiguracion}
      />
    )
  }

  const activeNavigation = navigation.find((item) => item.id === activePage)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#e2e8f0_100%)] p-4 sm:p-6">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_70px_-25px_rgba(15,23,42,0.35)]">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500">ORIGEN</p>

          <h1 className="mt-3 text-2xl font-black text-slate-950">
            Cargando datos desde Supabase
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Estamos preparando personas, constancias, caja, tienda, usuarios y reportes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-80 border-r border-slate-200 bg-slate-950 p-6 lg:flex lg:flex-col">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">ORIGEN</p>

          <h1 className="mt-3 text-2xl font-black">Panel admin</h1>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            Cada persona importa. Cada hábito cuenta.
          </p>
        </div>

        <nav className="mt-6 flex-1 space-y-2">
          {navigation.map((item) => {
            const isActive = activePage === item.id
            const Icon = navIcons[item.id]

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-slate-950' : 'text-slate-400'} />

                <span>
                  <p className="font-black">{item.label}</p>

                  <p
                    className={`mt-0.5 text-xs ${
                      isActive ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {item.description}
                  </p>
                </span>
              </button>
            )
          })}
        </nav>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 text-white">
          <p className="text-sm font-black">{usuario.nombre}</p>
          <p className="mt-1 text-xs text-slate-300">{usuario.correo}</p>

          <button
            type="button"
            onClick={onLogout}
            className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-900 transition hover:bg-slate-100"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="lg:pl-80">
        {/* Header móvil + desktop */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                Panel administrativo
              </p>

              <h2 className="truncate text-xl font-black text-slate-950 sm:text-2xl">
                {activeNavigation ? activeNavigation.label : 'ORIGEN'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 sm:block">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Sesión</p>
                <p className="text-sm font-black text-slate-900">{usuario.nombre}</p>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="hidden rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 sm:block"
              >
                Salir
              </button>

              {/* Botón menú móvil */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 lg:hidden"
                aria-label="Abrir menú"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </header>

        {/* Menú móvil desplegable */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm lg:hidden">
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Sesión</p>
                <p className="text-sm font-black text-slate-900">{usuario.nombre}</p>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white"
              >
                <LogOut size={16} />
                Salir
              </button>
            </div>

            <nav className="grid grid-cols-2 gap-2">
              {navigation.map((item) => {
                const isActive = activePage === item.id
                const Icon = navIcons[item.id]

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.id)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                      isActive
                        ? 'bg-slate-950 text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span className="text-sm font-black">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        )}

        <main className="p-4 pb-24 md:p-8 lg:pb-8">{renderPage()}</main>
      </div>

      {/* Barra de navegación inferior móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
          {primaryNav.map((id) => {
            const item = navigation.find((nav) => nav.id === id)!
            const isActive = activePage === id
            const Icon = navIcons[id]

            return (
              <button
                key={id}
                type="button"
                onClick={() => navigate(id)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition ${
                  isActive ? 'text-slate-950' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-black ${isActive ? '' : 'font-bold'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}

          {/* Botón "Más" */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition ${
              mobileMenuOpen ? 'text-slate-950' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MoreHorizontal size={22} />
            <span className="text-[10px] font-black">Más</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
