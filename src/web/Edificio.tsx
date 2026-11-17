import { iso, linea, poligono, type Punto } from '@/lib/iso'
import { cn } from '@/lib/utils'

// Torre en líneas finas: se usa en la portada (se dibuja sola) y como versión simple de la preventa
const ANCHO = 5
const FONDO = 4
const ALTO_PISO = 1
const ESCALA = 24

type Props = {
  pisos: number
  resaltado?: number // índice 0 = planta baja
  dibujar?: boolean
  alElegir?: (indice: number) => void
  agotados?: number[]
  className?: string
}

export function Edificio({ pisos, resaltado, dibujar, alElegir, agotados = [], className }: Props) {
  const H = pisos * ALTO_PISO
  const p = (x: number, y: number, z: number): Punto => iso(x, y, z, ESCALA)
  const minX = p(0, FONDO, 0)[0] - 4
  const maxX = p(ANCHO, 0, 0)[0] + 4
  const minY = p(0, 0, H + 0.6)[1] - 4
  const maxY = p(ANCHO, FONDO, 0)[1] + 4
  const trazo = (retraso: number) => (dibujar ? { className: 'trazo', pathLength: 100, style: { '--largo': 100, '--retraso': `${retraso}s` } as React.CSSProperties } : {})

  const caraPiso = (i: number) => {
    const z0 = i * ALTO_PISO
    const z1 = z0 + ALTO_PISO
    return {
      izq: poligono([p(0, FONDO, z0), p(ANCHO, FONDO, z0), p(ANCHO, FONDO, z1), p(0, FONDO, z1)]),
      der: poligono([p(ANCHO, FONDO, z0), p(ANCHO, 0, z0), p(ANCHO, 0, z1), p(ANCHO, FONDO, z1)]),
    }
  }

  return (
    <svg viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} className={cn('block max-w-full', className)} aria-hidden="true" fill="none" strokeLinecap="round">
      {/* Pisos que se pueden elegir (solo con el mouse; los botones del panel son el control accesible) */}
      {Array.from({ length: pisos }, (_, i) => {
        const c = caraPiso(i)
        const activo = i === resaltado
        const agotado = agotados.includes(i)
        return (
          <g key={i} onClick={alElegir ? () => alElegir(i) : undefined} className={cn(alElegir && 'cursor-pointer [&:hover>path]:fill-tinta/[0.06]')}>
            <path d={c.izq} className={cn(activo ? 'fill-ladrillo/25' : agotado ? 'fill-concreto/50' : 'fill-transparent')} />
            <path d={c.der} className={cn(activo ? 'fill-ladrillo/35' : agotado ? 'fill-concreto/70' : 'fill-transparent')} />
          </g>
        )
      })}

      {/* Parteluces de las ventanas */}
      <g className="stroke-tinta/25" strokeWidth={0.6}>
        {Array.from({ length: ANCHO - 1 }, (_, i) => <path key={`x${i}`} d={linea([p(i + 1, FONDO, 0), p(i + 1, FONDO, H)])} {...trazo(0.2 + i * 0.05)} />)}
        {Array.from({ length: FONDO - 1 }, (_, i) => <path key={`y${i}`} d={linea([p(ANCHO, i + 1, 0), p(ANCHO, i + 1, H)])} {...trazo(0.3 + i * 0.05)} />)}
      </g>

      {/* Losas */}
      <g className="stroke-tinta" strokeWidth={1}>
        {Array.from({ length: pisos + 1 }, (_, i) => (
          <path key={i} d={linea([p(0, FONDO, i * ALTO_PISO), p(ANCHO, FONDO, i * ALTO_PISO), p(ANCHO, 0, i * ALTO_PISO)])} {...trazo(0.35 + i * 0.06)} />
        ))}
      </g>

      {/* Aristas y techo */}
      <g className="stroke-tinta" strokeWidth={1.3}>
        <path d={linea([p(0, FONDO, 0), p(0, FONDO, H)])} {...trazo(0)} />
        <path d={linea([p(ANCHO, FONDO, 0), p(ANCHO, FONDO, H)])} {...trazo(0)} />
        <path d={linea([p(ANCHO, 0, 0), p(ANCHO, 0, H)])} {...trazo(0)} />
        <path d={poligono([p(0, 0, H), p(ANCHO, 0, H), p(ANCHO, FONDO, H), p(0, FONDO, H)])} {...trazo(0.35 + pisos * 0.06)} />
        <path d={poligono([p(1.5, 1, H + 0.6), p(3.5, 1, H + 0.6), p(3.5, 2.6, H + 0.6), p(1.5, 2.6, H + 0.6)])} strokeWidth={0.8} {...trazo(0.5 + pisos * 0.06)} />
        <path d={linea([p(3.5, 2.6, H), p(3.5, 2.6, H + 0.6)])} strokeWidth={0.8} {...trazo(0.5 + pisos * 0.06)} />
        <path d={linea([p(1.5, 2.6, H), p(1.5, 2.6, H + 0.6)])} strokeWidth={0.8} {...trazo(0.5 + pisos * 0.06)} />
        <path d={linea([p(3.5, 1, H), p(3.5, 1, H + 0.6)])} strokeWidth={0.8} {...trazo(0.5 + pisos * 0.06)} />
      </g>

      {resaltado !== undefined && (
        <path
          d={linea([p(0, FONDO, resaltado + 1), p(ANCHO, FONDO, resaltado + 1), p(ANCHO, 0, resaltado + 1)])}
          className="stroke-ladrillo" strokeWidth={2}
        />
      )}
    </svg>
  )
}
