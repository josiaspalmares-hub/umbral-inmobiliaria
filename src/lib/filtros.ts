import type { Operacion, Propiedad, Zona } from '@/datos'

export type Filtros = {
  operacion: Operacion
  zona: Zona | 'todas'
  habitaciones: number // mínimo; 0 = cualquiera
  precioMax: number // 0 = sin límite
}

export const FILTROS_INICIALES: Filtros = { operacion: 'venta', zona: 'todas', habitaciones: 0, precioMax: 0 }

export const TOPES: Record<Operacion, number[]> = {
  venta: [130000, 170000, 250000],
  alquiler: [700, 1000, 1500],
}

export function filtrar(lista: Propiedad[], f: Filtros): Propiedad[] {
  return lista.filter((p) =>
    p.operacion === f.operacion &&
    (f.zona === 'todas' || p.zona === f.zona) &&
    p.habitaciones >= f.habitaciones &&
    (f.precioMax === 0 || p.precio <= f.precioMax),
  )
}
