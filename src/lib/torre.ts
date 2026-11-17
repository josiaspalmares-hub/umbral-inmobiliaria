// Torre Umbral (preventa de muestra): pisos, apartamentos y plan de pagos

export type Tipo = 'A' | 'B' | 'C' | 'D'

export const TIPOS: Record<Tipo, { habitaciones: number; banos: number; m2: number; nota: string }> = {
  A: { habitaciones: 3, banos: 2, m2: 104, nota: 'Esquina con ventanas a dos fachadas' },
  B: { habitaciones: 2, banos: 2, m2: 78, nota: 'Sala con balcón hacia el Ávila' },
  C: { habitaciones: 2, banos: 2, m2: 78, nota: 'Más tranquilo, hacia el patio interno' },
  D: { habitaciones: 1, banos: 1, m2: 54, nota: 'Ideal para una persona o para alquilar' },
}

export const PRIMER_PISO = 2
export const ULTIMO_PISO = 13
export const PISOS = Array.from({ length: ULTIMO_PISO - PRIMER_PISO + 1 }, (_, i) => PRIMER_PISO + i)

const PRECIO_M2_BASE = 1250
const SUBE_POR_PISO = 14

export type Unidad = { codigo: string; piso: number; tipo: Tipo; precio: number; vendido: boolean }

// Vendidos fijos para que la muestra se vea igual en cada visita
const VENDIDOS = new Set(['2A', '2D', '3B', '4A', '5C', '5D', '6B', '7A', '8D', '9B', '10A', '11C', '12A', '12B', '12C', '12D', '13A'])

export function unidadesDelPiso(piso: number): Unidad[] {
  return (Object.keys(TIPOS) as Tipo[]).map((tipo) => {
    const codigo = `${piso}${tipo}`
    const precioM2 = PRECIO_M2_BASE + (piso - PRIMER_PISO) * SUBE_POR_PISO
    return { codigo, piso, tipo, precio: Math.round((TIPOS[tipo].m2 * precioM2) / 500) * 500, vendido: VENDIDOS.has(codigo) }
  })
}

export const disponiblesEnPiso = (piso: number) => unidadesDelPiso(piso).filter((u) => !u.vendido).length

export const MESES_HASTA_ENTREGA = 24

export type Plan = { inicial: number; saldo: number; cuota: number }

// Sin crédito: inicial y el resto en cuotas iguales hasta la entrega
export function planDePagos(precio: number, porcentajeInicial: number, meses = MESES_HASTA_ENTREGA): Plan {
  if (precio <= 0 || meses <= 0) throw new Error('Precio y meses deben ser mayores que cero')
  const pct = Math.min(Math.max(porcentajeInicial, 0), 100)
  const inicial = Math.round((precio * pct) / 100)
  const saldo = precio - inicial
  return { inicial, saldo, cuota: Math.ceil(saldo / meses) }
}
