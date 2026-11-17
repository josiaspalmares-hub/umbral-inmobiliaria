import { iso, poligono, type Punto } from '@/lib/iso'
import type { Tipo } from '@/lib/torre'
import { cn } from '@/lib/utils'

// Plano isométrico de cada tipo de apartamento. Medidas en metros: [x, y, ancho, fondo]
type Ambiente = { nombre: string; r: [number, number, number, number]; tono?: 'social' | 'exterior' }

const PLANOS: Record<Tipo, Ambiente[]> = {
  A: [
    { nombre: 'Sala y comedor', r: [0, 0, 6, 5], tono: 'social' },
    { nombre: 'Cocina', r: [6, 0, 4, 3] },
    { nombre: 'Lavadero', r: [6, 3, 4, 2] },
    { nombre: 'Principal', r: [0, 5, 5, 5] },
    { nombre: 'Baño', r: [5, 5, 2, 2.5] },
    { nombre: 'Baño', r: [5, 7.5, 2, 2.5] },
    { nombre: 'Hab. 2', r: [7, 5, 3, 2.5] },
    { nombre: 'Hab. 3', r: [7, 7.5, 3, 2.5] },
  ],
  B: [
    { nombre: 'Balcón', r: [0, -1.4, 4, 1.4], tono: 'exterior' },
    { nombre: 'Sala y comedor', r: [0, 0, 5.5, 4.5], tono: 'social' },
    { nombre: 'Cocina', r: [5.5, 0, 3.5, 3] },
    { nombre: 'Baño', r: [5.5, 3, 3.5, 1.5] },
    { nombre: 'Principal', r: [0, 4.5, 4.5, 4] },
    { nombre: 'Baño', r: [4.5, 4.5, 1.5, 4] },
    { nombre: 'Hab. 2', r: [6, 4.5, 3, 4] },
  ],
  C: [
    { nombre: 'Sala y comedor', r: [3.5, 0, 5.5, 4.5], tono: 'social' },
    { nombre: 'Cocina', r: [0, 0, 3.5, 3] },
    { nombre: 'Baño', r: [0, 3, 3.5, 1.5] },
    { nombre: 'Principal', r: [4.5, 4.5, 4.5, 4] },
    { nombre: 'Baño', r: [3, 4.5, 1.5, 4] },
    { nombre: 'Hab. 2', r: [0, 4.5, 3, 4] },
  ],
  D: [
    { nombre: 'Sala', r: [0, 0, 4.5, 4], tono: 'social' },
    { nombre: 'Cocina', r: [4.5, 0, 3, 2.5] },
    { nombre: 'Baño', r: [4.5, 2.5, 3, 1.5] },
    { nombre: 'Habitación', r: [0, 4, 7.5, 3.2] },
  ],
}

const ESCALA = 22
const MURO = 0.7

export function Plano({ tipo, className }: { tipo: Tipo; className?: string }) {
  const ambientes = PLANOS[tipo]
  const p = (x: number, y: number, z = 0): Punto => iso(x, y, z, ESCALA)

  const xs = ambientes.flatMap((a) => [a.r[0], a.r[0] + a.r[2]])
  const ys = ambientes.flatMap((a) => [a.r[1], a.r[1] + a.r[3]])
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const minX = p(x0, y1)[0] - 6
  const maxX = p(x1, y0)[0] + 6
  const minY = p(x0, y0, MURO)[1] - 6
  const maxY = p(x1, y1)[1] + 6

  return (
    <svg viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} className={cn('h-auto w-full', className)} role="img" aria-label={`Plano del apartamento tipo ${tipo}: ${ambientes.map((a) => a.nombre).join(', ')}`}>
      {ambientes.map((a, i) => {
        const [x, y, w, d] = a.r
        return (
          <path key={i} d={poligono([p(x, y), p(x + w, y), p(x + w, y + d), p(x, y + d)])}
            className={cn('stroke-tinta', a.tono === 'social' ? 'fill-ladrillo/20' : a.tono === 'exterior' ? 'fill-ok/15' : 'fill-white')}
            strokeWidth={0.9} strokeLinejoin="round" />
        )
      })}
      {/* Muros del fondo para dar volumen */}
      {ambientes.filter((a) => a.tono !== 'exterior').map((a, i) => {
        const [x, y, w, d] = a.r
        return (
          <g key={i} className="fill-papel-2 stroke-tinta" strokeWidth={0.9} strokeLinejoin="round">
            <path d={poligono([p(x, y), p(x + w, y), p(x + w, y, MURO), p(x, y, MURO)])} />
            <path d={poligono([p(x, y), p(x, y + d), p(x, y + d, MURO), p(x, y, MURO)])} />
          </g>
        )
      })}
      {ambientes.map((a, i) => {
        const [x, y, w, d] = a.r
        const [cx, cy] = p(x + w / 2, y + d / 2)
        const grande = w * d >= 10
        return (
          <text key={i} x={cx} y={cy + 4} textAnchor="middle" className="fill-tinta font-sans" fontSize={grande ? 14 : 11} fontWeight={600}>
            {a.nombre}
            {grande && <tspan x={cx} dy={14} fontWeight={400} className="fill-gris">{Math.round(w * d)} m²</tspan>}
          </text>
        )
      })}
    </svg>
  )
}
