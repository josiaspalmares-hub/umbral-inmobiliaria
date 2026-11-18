import { iso, poligono } from '@/lib/iso'

// Logo: un umbral (puerta) hecho de cubos, como la torre
const CUBOS: [number, number, number][] = [
  [0, 0, 0], [0, 0, 1], [0, 0, 2],
  [2, 0, 0], [2, 0, 1], [2, 0, 2],
  [0, 0, 3], [1, 0, 3], [2, 0, 3],
]

export function logoSVG(tonos = { arriba: '#d9825f', izq: '#b5532f', der: '#8a3b20' }, escala = 14) {
  const p = (x: number, y: number, z: number) => iso(x, y, z, escala)
  const orden = [...CUBOS].sort((a, b) => a[0] + a[1] - (b[0] + b[1]) || a[2] - b[2])
  const caras = orden.map(([x, y, z]) => [
    `<path d="${poligono([p(x, y, z + 1), p(x + 1, y, z + 1), p(x + 1, y + 1, z + 1), p(x, y + 1, z + 1)])}" fill="${tonos.arriba}"/>`,
    `<path d="${poligono([p(x, y + 1, z), p(x + 1, y + 1, z), p(x + 1, y + 1, z + 1), p(x, y + 1, z + 1)])}" fill="${tonos.izq}"/>`,
    `<path d="${poligono([p(x + 1, y, z), p(x + 1, y + 1, z), p(x + 1, y + 1, z + 1), p(x + 1, y, z + 1)])}" fill="${tonos.der}"/>`,
  ].join('')).join('')
  const s = escala
  return `<svg viewBox="${-1.2 * s} ${-4.2 * s} ${4.2 * s} ${6.4 * s}" aria-hidden="true">${caras}</svg>`
}

// Curvas de nivel del Ávila: líneas finas y onduladas, textura de fondo de la marca
export function curvasSVG(ancho = 1200, alto = 700, lineas = 22, color = 'currentColor') {
  const cx = ancho * 0.72
  const cy = alto * 1.05
  const caminos: string[] = []
  for (let i = 0; i < lineas; i++) {
    const base = 60 + i * 34
    const pts: string[] = []
    for (let k = 0; k <= 120; k++) {
      const a = (k / 120) * Math.PI * 2
      const r = base + Math.sin(a * 3 + i * 0.35) * (10 + i * 1.6) + Math.sin(a * 7 - i * 0.2) * 5 + Math.cos(a * 2 + i * 0.5) * 14
      pts.push(`${(cx + Math.cos(a) * r * 1.7).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`)
    }
    caminos.push(`<path d="M${pts.join('L')}Z"/>`)
  }
  return `<svg viewBox="0 0 ${ancho} ${alto}" preserveAspectRatio="xMidYMid slice" fill="none" stroke="${color}" stroke-width="0.8" aria-hidden="true">${caminos.join('')}</svg>`
}

export const PALETA = [
  { nombre: 'Hormigón', hex: '#EFEBE4', uso: 'Fondo principal, como una maqueta blanca.' },
  { nombre: 'Grafito', hex: '#1B1D1F', uso: 'Textos y la sección oscura de la torre.' },
  { nombre: 'Arcilla', hex: '#B5532F', uso: 'Solo acciones: botones y lo que eliges.' },
  { nombre: 'Atardecer', hex: '#F2B36B', uso: 'Luces de ventanas y brillo de la noche.' },
  { nombre: 'Ávila', hex: '#3F5A45', uso: 'Detalles de naturaleza: zonas, jardineras.' },
  { nombre: 'Plano', hex: '#C9C2B6', uso: 'Líneas finas, bordes y curvas de nivel.' },
]
