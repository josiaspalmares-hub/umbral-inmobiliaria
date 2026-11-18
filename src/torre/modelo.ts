// Torre Umbral en vóxeles, con el mismo diseño de la foto: marco de concreto claro, ladrillo en los extremos,
// balcones con jardineras en el centro y lobby de vidrio. Cada cubo sabe en qué etapa de la obra aparece.

export const ETAPAS = [
  { nombre: 'Terreno', texto: 'El lote limpio en Los Palos Grandes, con el plano marcado en el suelo.' },
  { nombre: 'Cimientos', texto: 'El concreto se vierte por capas. Aquí se apoya todo el edificio.' },
  { nombre: 'Estructura', texto: 'Columnas y losas suben piso por piso, de la planta baja al piso 8.' },
  { nombre: 'Paredes', texto: 'Ladrillo de arcilla, bloque por bloque, dejando el hueco de cada ventana.' },
  { nombre: 'Vidrio y balcones', texto: 'Ventanales, barandas y jardineras hacia el Ávila.' },
  { nombre: 'Entrega', texto: 'Luces encendidas: la torre lista para mudarse.' },
] as const

export type Material =
  | 'grama' | 'tierra' | 'acera' | 'asfalto' | 'concreto' | 'losa' | 'ladrillo' | 'vidrio' | 'marco'
  | 'jardinera' | 'planta' | 'tronco' | 'copa' | 'palma' | 'luz'

export type Voxel = { x: number; y: number; z: number; material: Material; etapa: number; orden: number }

export const ANCHO = 21 // x: 4 vanos de 4 cubos separados por columnas cada 5
export const FONDO = 13 // z: la fachada principal mira hacia z = FONDO - 1
export const PISOS = 11 // planta baja + 10 pisos
export const ALTO_PISO = 4 // 3 cubos de pared y 1 de losa, como la proporción de la foto
const LOTE = 8

const FRENTE = FONDO - 1
const COLUMNAS_X = [0, 5, 10, 15, 20]
const COLUMNAS_Z = [0, 6, FRENTE]
const VANO_CENTRAL = (x: number) => x > 5 && x < 15 && x !== 10 // balcones con jardinera
// Una ventana alta en el centro de cada vano de ladrillo (la posición 2 o 3 dentro del vano)
const VENTANA = (pos: number) => pos % 5 === 3

const azar = (a: number, b: number, c = 0) => {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453
  return s - Math.floor(s)
}

export function construirTorre(): Voxel[] {
  const v: Voxel[] = []
  const poner = (x: number, y: number, z: number, material: Material, etapa: number, orden: number) =>
    v.push({ x, y, z, material, etapa, orden: Math.min(Math.max(orden, 0), 1) })

  // 1. Terreno: grama, acera y calle al frente, y la huella de la torre en tierra
  for (let x = -LOTE; x < ANCHO + LOTE; x++) {
    for (let z = -LOTE; z < FONDO + LOTE; z++) {
      const dentro = x >= 0 && x < ANCHO && z >= 0 && z < FONDO
      const calle = z >= FONDO + LOTE - 3
      const acera = z >= FONDO + 2 && !calle
      const d = Math.hypot(x - ANCHO / 2, z - FONDO / 2)
      poner(x, -1, z, dentro ? 'tierra' : calle ? 'asfalto' : acera ? 'acera' : 'grama', 0, d / 20)
    }
  }

  // 2. Cimientos
  for (let x = -1; x <= ANCHO; x++)
    for (let z = -1; z <= FONDO; z++) poner(x, 0, z, 'concreto', 1, (x + 1) / (ANCHO + 2) + azar(x, z) * 0.08)

  const techo = PISOS * ALTO_PISO
  for (let p = 0; p < PISOS; p++) {
    const base = p * ALTO_PISO
    const avance = p / PISOS

    // 3. Estructura: marco de concreto claro (columnas en la fachada) y losas
    for (let x = 0; x < ANCHO; x++)
      for (let z = 0; z < FONDO; z++) {
        const borde = x === 0 || z === 0 || x === ANCHO - 1 || z === FRENTE
        const columna = borde && ((COLUMNAS_X.includes(x) && (z === 0 || z === FRENTE)) || (COLUMNAS_Z.includes(z) && (x === 0 || x === ANCHO - 1)))
        if (columna) for (let y = 1; y < ALTO_PISO; y++) poner(x, base + y, z, 'concreto', 2, avance + (y / ALTO_PISO) * 0.05)
        poner(x, base + ALTO_PISO, z, 'losa', 2, avance + 0.06 + azar(x, z, p) * 0.03)
      }

    // 4 y 5. Fachadas: ladrillo, ventanas, balcones y jardineras
    for (let y = base + 1; y < base + ALTO_PISO; y++) {
      const o = avance + ((y - base) / ALTO_PISO) * 0.06
      // Frente
      for (let x = 1; x < ANCHO - 1; x++) {
        if (COLUMNAS_X.includes(x)) continue
        if (p === 0) { poner(x, y, FRENTE, 'vidrio', 4, o); continue } // lobby de doble altura en vidrio
        if (VANO_CENTRAL(x)) {
          poner(x, y, FRENTE - 1, 'vidrio', 4, o) // ventanal retirado: el balcón queda delante
          if (y === base + 1) poner(x, y, FRENTE, 'jardinera', 4, o + 0.01)
          else if (y === base + 2 && azar(x, y) > 0.25) poner(x, y, FRENTE, 'planta', 4, o + 0.02)
        } else {
          const ventana = VENTANA(x)
          poner(x, y, FRENTE, ventana ? 'vidrio' : 'ladrillo', ventana ? 4 : 3, o)
        }
      }
      // Fondo y costados: ladrillo con ventanas verticales
      for (let x = 1; x < ANCHO - 1; x++) {
        if (COLUMNAS_X.includes(x)) continue
        const ventana = VENTANA(x)
        poner(x, y, 0, ventana ? 'vidrio' : 'ladrillo', ventana ? 4 : 3, o)
      }
      for (const x of [0, ANCHO - 1])
        for (let z = 1; z < FRENTE; z++) {
          if (COLUMNAS_Z.includes(z)) continue
          const ventana = VENTANA(z)
          poner(x, y, z, ventana ? 'vidrio' : 'ladrillo', ventana ? 4 : 3, o)
        }
    }
  }

  // Remate de la azotea y cuarto de máquinas
  for (let x = 0; x < ANCHO; x++)
    for (let z = 0; z < FONDO; z++) {
      if (x === 0 || z === 0 || x === ANCHO - 1 || z === FRENTE) poner(x, techo + 1, z, 'losa', 4, 0.9 + azar(x, z) * 0.1)
    }
  for (let x = 7; x < 14; x++) for (let z = 4; z < 9; z++) for (let y = 1; y <= 2; y++) poner(x, techo + y, z, 'concreto', 4, 0.95)

  // 6. Entrega: árboles tropicales y luces encendidas
  const palmas: [number, number][] = [[-2, FONDO + 3], [ANCHO + 1, FONDO + 3], [4, FONDO + 3], [16, FONDO + 3]]
  palmas.forEach(([ax, az], i) => {
    const orden = i / 10
    for (let y = 0; y < 7; y++) poner(ax, y, az, 'tronco', 5, orden)
    for (const [dx, dz] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2]]) poner(ax + dx, 7, az + dz, 'palma', 5, orden + 0.05)
    poner(ax, 8, az, 'palma', 5, orden + 0.06)
  })
  const arboles: [number, number][] = [[-5, 2], [-6, 9], [ANCHO + 4, 1], [ANCHO + 5, 8], [-4, -4], [ANCHO + 2, -5]]
  arboles.forEach(([ax, az], i) => {
    const orden = 0.4 + i / 12
    for (let y = 0; y < 3; y++) poner(ax, y, az, 'tronco', 5, orden)
    for (let dx = -2; dx <= 2; dx++)
      for (let dz = -2; dz <= 2; dz++)
        for (let y = 3; y < 7; y++) {
          const r = Math.abs(dx) + Math.abs(dz) + Math.abs(y - 4.5)
          if (r < 3.6 && azar(ax + dx, y, az + dz) > 0.12) poner(ax + dx, y, az + dz, 'copa', 5, orden + 0.04)
        }
  })
  for (const c of v.filter((c) => c.material === 'vidrio')) {
    const lobby = c.y <= ALTO_PISO
    if (lobby || azar(c.x, c.y, c.z) > 0.45) v.push({ ...c, material: 'luz', etapa: 5, orden: lobby ? 0 : azar(c.z, c.x, c.y) })
  }
  return v
}

export const COLORES: Record<Material, string[]> = {
  grama: ['#6f8f55', '#7a9a5e', '#68874f'],
  tierra: ['#8a6a4d', '#7d5f44', '#94735a'],
  acera: ['#d3cdc2', '#c9c3b8'],
  asfalto: ['#4a4c4f', '#525457'],
  concreto: ['#d6d2ca', '#cfcac1', '#dcd8d0'],
  losa: ['#c8c3ba', '#d0cbc2'],
  ladrillo: ['#cf7350', '#c56a48', '#d97d58', '#c06446'],
  vidrio: ['#3b4248', '#434b52', '#353c42'],
  marco: ['#2b2e31'],
  jardinera: ['#2f3236'],
  planta: ['#4f7a3d', '#5d8a46', '#467036', '#6a9650'],
  tronco: ['#6a4b35', '#7a5a40'],
  copa: ['#4d7a3f', '#58864a', '#447038', '#62904f'],
  palma: ['#5f8f45', '#6c9b4f'],
  luz: ['#ffcf7a', '#ffd88f', '#f9c066'],
}
