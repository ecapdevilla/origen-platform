import { getStorageItem, setStorageItem } from '@/shared/lib/storage'
import type { RegistroBienestar } from '@/shared/types/bienestar'
import type { MovimientoCaja, Servicio } from '@/shared/types/comercial'
import type { Constancia } from '@/shared/types/constancia'
import type { PlanEntrenamiento } from '@/shared/types/entrenamiento'
import type { Persona } from '@/shared/types/persona'
import type { MedidaCorporal } from '@/shared/types/progreso'
import type { MovimientoInventario, Producto } from '@/shared/types/tienda'

const PERSONAS_KEY = 'origen_personas_v1'
const CONSTANCIA_KEY = 'origen_constancias_v1'
const SERVICIOS_KEY = 'origen_servicios_v1'
const MOVIMIENTOS_KEY = 'origen_movimientos_caja_v1'
const PRODUCTOS_KEY = 'origen_productos_v1'
const INVENTARIO_KEY = 'origen_movimientos_inventario_v1'
const PLANES_KEY = 'origen_planes_entrenamiento_v1'
const BIENESTAR_KEY = 'origen_bienestar_v1'
const MEDIDAS_KEY = 'origen_medidas_v1'

export function cargarDatosDemoOrigen() {
  const hoy = new Date().toISOString().slice(0, 10)
  const ayer = obtenerFechaDiasAntes(1)
  const haceDosDias = obtenerFechaDiasAntes(2)

  const personas: Persona[] = [
    {
      id: 'persona-1',
      nombres: 'Laura',
      apellidos: 'Martínez',
      documento: '1002003001',
      telefono: '3001112233',
      correo: 'laura@origen.demo',
      objetivo: 'Bajar grasa y mejorar resistencia',
      estado: 'activa',
      referidoPor: 'Instagram',
      fechaRegistro: haceDosDias,
    },
    {
      id: 'persona-2',
      nombres: 'Carlos',
      apellidos: 'Ramírez',
      documento: '1002003002',
      telefono: '3002223344',
      correo: 'carlos@origen.demo',
      objetivo: 'Ganar masa muscular',
      estado: 'activa',
      referidoPor: 'Referido',
      fechaRegistro: ayer,
    },
    {
      id: 'persona-3',
      nombres: 'Daniela',
      apellidos: 'Pérez',
      documento: '1002003003',
      telefono: '3003334455',
      correo: 'daniela@origen.demo',
      objetivo: 'Tonificar y crear constancia',
      estado: 'activa',
      referidoPor: 'Facebook',
      fechaRegistro: hoy,
    },
  ]

  const constancias: Constancia[] = [
    {
      id: 'constancia-1',
      personaId: 'persona-1',
      fecha: hoy,
      registradoPor: 'admin',
      observacion: 'Entrenó tren inferior',
    },
    {
      id: 'constancia-2',
      personaId: 'persona-2',
      fecha: hoy,
      registradoPor: 'admin',
      observacion: 'Rutina de fuerza',
    },
    {
      id: 'constancia-3',
      personaId: 'persona-1',
      fecha: ayer,
      registradoPor: 'persona',
    },
  ]

  const servicios: Servicio[] = [
    {
      id: 'servicio-1',
      nombre: 'Mensualidad General',
      tipo: 'membresia',
      precio: 90000,
      duracionDias: 30,
      activo: true,
      fechaCreacion: haceDosDias,
    },
    {
      id: 'servicio-2',
      nombre: 'Plan Personalizado',
      tipo: 'personalizado',
      precio: 180000,
      duracionDias: 30,
      activo: true,
      fechaCreacion: ayer,
    },
  ]

  const movimientos: MovimientoCaja[] = [
    {
      id: 'movimiento-1',
      tipo: 'ingreso',
      concepto: 'Mensualidad General - Laura Martínez',
      valor: 90000,
      fecha: hoy,
      personaId: 'persona-1',
      servicioId: 'servicio-1',
      metodoPago: 'Nequi',
    },
    {
      id: 'movimiento-2',
      tipo: 'ingreso',
      concepto: 'Plan Personalizado - Carlos Ramírez',
      valor: 180000,
      fecha: hoy,
      personaId: 'persona-2',
      servicioId: 'servicio-2',
      metodoPago: 'Transferencia',
    },
    {
      id: 'movimiento-3',
      tipo: 'gasto',
      concepto: 'Compra productos tienda',
      valor: 65000,
      fecha: ayer,
      metodoPago: 'Efectivo',
    },
  ]

  const productos: Producto[] = [
    {
      id: 'producto-1',
      nombre: 'Agua',
      categoria: 'Bebidas',
      precioVenta: 4000,
      costo: 2200,
      stock: 18,
      activo: true,
      fechaCreacion: haceDosDias,
    },
    {
      id: 'producto-2',
      nombre: 'Proteína personal',
      categoria: 'Suplementos',
      precioVenta: 12000,
      costo: 7500,
      stock: 7,
      activo: true,
      fechaCreacion: ayer,
    },
    {
      id: 'producto-3',
      nombre: 'Bebida hidratante',
      categoria: 'Bebidas',
      precioVenta: 6000,
      costo: 3500,
      stock: 2,
      activo: true,
      fechaCreacion: hoy,
    },
  ]

  const inventario: MovimientoInventario[] = [
    {
      id: 'inventario-1',
      productoId: 'producto-1',
      tipo: 'entrada',
      cantidad: 20,
      fecha: haceDosDias,
      observacion: 'Inventario inicial',
    },
    {
      id: 'inventario-2',
      productoId: 'producto-2',
      tipo: 'entrada',
      cantidad: 10,
      fecha: ayer,
      observacion: 'Inventario inicial',
    },
    {
      id: 'inventario-3',
      productoId: 'producto-1',
      tipo: 'venta',
      cantidad: 2,
      fecha: hoy,
      observacion: 'Venta tienda',
    },
  ]

  const planes: PlanEntrenamiento[] = [
    {
      id: 'plan-1',
      personaId: 'persona-1',
      nombre: 'Plan pérdida de grasa',
      objetivo: 'Mejorar resistencia y bajar grasa',
      diasSemana: 4,
      descripcion: 'Fuerza general, tren inferior y cardio moderado.',
      estado: 'activo',
      fechaCreacion: ayer,
    },
    {
      id: 'plan-2',
      personaId: 'persona-2',
      nombre: 'Hipertrofia inicial',
      objetivo: 'Ganar masa muscular',
      diasSemana: 5,
      descripcion: 'Rutina por grupos musculares con progresión de cargas.',
      estado: 'activo',
      fechaCreacion: ayer,
    },
  ]

  const bienestar: RegistroBienestar[] = [
    {
      id: 'bienestar-1',
      personaId: 'persona-1',
      fecha: hoy,
      estadoAnimo: 'Motivada',
      horasSueno: 7,
      vasosAgua: 6,
      energia: 8,
      nota: 'Buena energía durante el entrenamiento.',
    },
    {
      id: 'bienestar-2',
      personaId: 'persona-2',
      fecha: hoy,
      estadoAnimo: 'Fuerte',
      horasSueno: 6,
      vasosAgua: 5,
      energia: 7,
      nota: 'Entrenó con buena carga.',
    },
  ]

  const medidas: MedidaCorporal[] = [
    {
      id: 'medida-1',
      personaId: 'persona-1',
      fecha: hoy,
      pesoKg: 68,
      estaturaCm: 165,
      cinturaCm: 78,
      pechoCm: 92,
      brazoCm: 29,
      piernaCm: 54,
      observacion: 'Medición inicial',
    },
    {
      id: 'medida-2',
      personaId: 'persona-2',
      fecha: hoy,
      pesoKg: 78,
      estaturaCm: 174,
      cinturaCm: 84,
      pechoCm: 100,
      brazoCm: 35,
      piernaCm: 58,
      observacion: 'Inicio de plan de hipertrofia',
    },
  ]

  setStorageItem(PERSONAS_KEY, personas)
  setStorageItem(CONSTANCIA_KEY, constancias)
  setStorageItem(SERVICIOS_KEY, servicios)
  setStorageItem(MOVIMIENTOS_KEY, movimientos)
  setStorageItem(PRODUCTOS_KEY, productos)
  setStorageItem(INVENTARIO_KEY, inventario)
  setStorageItem(PLANES_KEY, planes)
  setStorageItem(BIENESTAR_KEY, bienestar)
  setStorageItem(MEDIDAS_KEY, medidas)
}

export function obtenerDatosDemoOrigen() {
  return {
    personas: getStorageItem<Persona[]>(PERSONAS_KEY, []),
    constancias: getStorageItem<Constancia[]>(CONSTANCIA_KEY, []),
    servicios: getStorageItem<Servicio[]>(SERVICIOS_KEY, []),
    movimientos: getStorageItem<MovimientoCaja[]>(MOVIMIENTOS_KEY, []),
    productos: getStorageItem<Producto[]>(PRODUCTOS_KEY, []),
    movimientosInventario: getStorageItem<MovimientoInventario[]>(INVENTARIO_KEY, []),
    planes: getStorageItem<PlanEntrenamiento[]>(PLANES_KEY, []),
    bienestar: getStorageItem<RegistroBienestar[]>(BIENESTAR_KEY, []),
    medidas: getStorageItem<MedidaCorporal[]>(MEDIDAS_KEY, []),
  }
}

function obtenerFechaDiasAntes(dias: number) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - dias)
  return fecha.toISOString().slice(0, 10)
}

export function limpiarDatosOrigen() {
  localStorage.removeItem(PERSONAS_KEY)
  localStorage.removeItem(CONSTANCIA_KEY)
  localStorage.removeItem(SERVICIOS_KEY)
  localStorage.removeItem(MOVIMIENTOS_KEY)
  localStorage.removeItem(PRODUCTOS_KEY)
  localStorage.removeItem(INVENTARIO_KEY)
  localStorage.removeItem(PLANES_KEY)
  localStorage.removeItem(BIENESTAR_KEY)
  localStorage.removeItem(MEDIDAS_KEY)
}