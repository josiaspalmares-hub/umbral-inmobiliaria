// Proyección isométrica para los dibujos en SVG (edificio y planos)
const COS = Math.cos(Math.PI / 6)
const SEN = Math.sin(Math.PI / 6)

export type Punto = [number, number]

export function iso(x: number, y: number, z = 0, escala = 1): Punto {
  return [(x - y) * COS * escala, ((x + y) * SEN - z) * escala]
}

export const linea = (pts: Punto[]) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L')
export const poligono = (pts: Punto[]) => linea(pts) + 'Z'
