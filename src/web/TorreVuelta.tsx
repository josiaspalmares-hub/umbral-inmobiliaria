import { PISOS } from '@/lib/torre'
import { useEffect, useRef, useState } from 'react'

// Torre que gira (toma de dron de costado a costado) con el piso elegido marcado encima
const CUADROS = 59 // cada cuadro equivale a 2 cuadros del video unido (118)
const ANCHO_VIDEO = 1280
const ALTO_VIDEO = 720
const ULTIMO = PISOS.length // 8 pisos de apartamentos
const FRENTE = 40 // cuadro donde la torre se ve de frente: ahí empieza

type Borde = [x: number, arriba: number, abajo: number] // arriba = techo del piso 8, abajo = piso del 1
type Clave = { cuadro: number; bordes: [Borde, Borde, Borde] } // izquierda, esquina, derecha

// Medidos a mano sobre el video unido (1280 × 720)
const CLAVES: Clave[] = [
  { cuadro: 0, bordes: [[330, 145, 500], [720, 100, 555], [870, 135, 545]] },
  { cuadro: 30, bordes: [[440, 165, 525], [650, 80, 560], [925, 105, 555]] },
  { cuadro: 60, bordes: [[515, 78, 556], [520, 78, 556], [865, 78, 556]] },
  { cuadro: 79, bordes: [[465, 68, 556], [800, 68, 556], [825, 75, 552]] },
  { cuadro: 100, bordes: [[410, 95, 545], [685, 45, 575], [870, 155, 525]] },
  { cuadro: 117, bordes: [[405, 115, 545], [560, 45, 570], [905, 140, 545]] },
]

function bordesEn(cuadroVideo: number): [Borde, Borde, Borde] {
  const k = CLAVES.findIndex((c) => c.cuadro >= cuadroVideo)
  if (k <= 0) return CLAVES[Math.max(k, 0)].bordes
  const a = CLAVES[k - 1]
  const b = CLAVES[k]
  const t = (cuadroVideo - a.cuadro) / (b.cuadro - a.cuadro)
  return a.bordes.map((ba, i) => ba.map((v, j) => v + (b.bordes[i][j] - v) * t)) as [Borde, Borde, Borde]
}

// Las dos caras del piso n como polígonos (en coordenadas del video)
function carasDelPiso(piso: number, bordes: [Borde, Borde, Borde]) {
  const y = ([, arriba, abajo]: Borde, n: number) => arriba + ((abajo - arriba) * n) / ULTIMO
  const cara = (a: Borde, b: Borde) => [
    [a[0], y(a, ULTIMO - piso)], [b[0], y(b, ULTIMO - piso)], [b[0], y(b, ULTIMO - piso + 1)], [a[0], y(a, ULTIMO - piso + 1)],
  ]
  return [cara(bordes[0], bordes[1]), cara(bordes[1], bordes[2])]
}

const ruta = (carpeta: string, i: number) => `/img/vuelta/${carpeta}/${String(i).padStart(2, '0')}.webp`

type Props = { piso: number; alElegir: (p: number) => void }

export function TorreVuelta({ piso, alElegir }: Props) {
  const lienzo = useRef<HTMLCanvasElement>(null)
  const estado = useRef({ piso, alElegir, i: FRENTE, arrastre: null as null | { x: number; desde: number; movio: boolean }, pedir: () => {} })
  estado.current.piso = piso
  estado.current.alElegir = alElegir
  const [listos, setListos] = useState(0)

  useEffect(() => {
    const canvas = lienzo.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const s = estado.current
    const carpeta = innerWidth * Math.min(devicePixelRatio, 2) >= 1400 ? 'hd' : 'sd'
    const imgs: (HTMLImageElement | null)[] = Array(CUADROS).fill(null)
    let vivo = true
    // Primero el cuadro de frente, luego los más cercanos a él
    const orden = Array.from({ length: CUADROS }, (_, k) => k).sort((a, b) => Math.abs(a - FRENTE) - Math.abs(b - FRENTE))
    let siguiente = 0
    const bajar = () => {
      const k = orden[siguiente++]
      if (k === undefined || !vivo) return
      const img = new Image()
      img.onload = () => { imgs[k] = img; if (vivo) { setListos((n) => n + 1); pedir() } bajar() }
      img.onerror = () => { console.warn(`No cargó el cuadro ${k} de la vuelta`); bajar() }
      img.src = ruta(carpeta, k)
    }
    for (let n = 0; n < 4; n++) bajar()

    // Encuadre: en pantallas angostas se recorta en vertical siguiendo al edificio
    const ventana = (bordes: [Borde, Borde, Borde]) => {
      const { width: w, height: h } = canvas
      const escala = h / ALTO_VIDEO
      const anchoVisible = w / escala
      if (anchoVisible >= ANCHO_VIDEO) return { escala: w / ANCHO_VIDEO, x0: 0, y0: (h - ALTO_VIDEO * (w / ANCHO_VIDEO)) / 2 }
      const centro = (bordes[0][0] + bordes[2][0]) / 2
      const x0 = Math.min(Math.max(centro - anchoVisible / 2, 0), ANCHO_VIDEO - anchoVisible)
      return { escala, x0: -x0 * escala, y0: 0 }
    }

    // Se dibuja solo cuando algo cambia: al arrastrar, al elegir piso o al cargar un cuadro
    let cuadro = 0
    const dibujar = () => {
      cuadro = 0
      const k = Math.round(s.i)
      let img = imgs[k]
      for (let d = 1; !img && d < CUADROS; d++) img = imgs[k - d] ?? imgs[k + d] ?? null
      if (!img) return
      const bordes = bordesEn(k * 2)
      const v = ventana(bordes)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, v.x0, v.y0, ANCHO_VIDEO * v.escala, ALTO_VIDEO * v.escala)
      // Piso elegido: relleno arcilla con borde de luz
      ctx.save()
      ctx.translate(v.x0, v.y0)
      ctx.scale(v.escala, v.escala)
      for (const cara of carasDelPiso(s.piso, bordes)) {
        ctx.beginPath()
        cara.forEach(([x, y], n) => (n ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
        ctx.closePath()
        ctx.fillStyle = 'rgba(217, 115, 74, 0.42)'
        ctx.fill()
        ctx.lineWidth = 2.5
        ctx.strokeStyle = '#f2b36b'
        ctx.shadowColor = 'rgba(242, 179, 107, 0.8)'
        ctx.shadowBlur = 14
        ctx.stroke()
      }
      ctx.restore()
    }
    const pedir = () => { if (!cuadro) cuadro = requestAnimationFrame(dibujar) }
    s.pedir = pedir
    const ajustar = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(devicePixelRatio, 2)
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
      pedir()
    }
    ajustar()
    const ro = new ResizeObserver(ajustar)
    ro.observe(canvas)

    // Tocar un piso en la imagen lo elige
    const pisoEn = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect()
      const dpr = canvas.width / r.width
      const bordes = bordesEn(Math.round(s.i) * 2)
      const v = ventana(bordes)
      const x = ((cx - r.left) * dpr - v.x0) / v.escala
      const y = ((cy - r.top) * dpr - v.y0) / v.escala
      return PISOS.find((p) => carasDelPiso(p, bordes).some((cara) => dentro(x, y, cara)))
    }
    const bajarDedo = (e: PointerEvent) => { s.arrastre = { x: e.clientX, desde: s.i, movio: false }; canvas.setPointerCapture(e.pointerId) }
    const mover = (e: PointerEvent) => {
      const a = s.arrastre
      if (!a) { canvas.style.cursor = pisoEn(e.clientX, e.clientY) ? 'pointer' : 'grab'; return }
      const dx = e.clientX - a.x
      if (Math.abs(dx) > 4) a.movio = true
      s.i = Math.min(Math.max(a.desde - (dx / canvas.getBoundingClientRect().width) * CUADROS * 1.1, 0), CUADROS - 1)
      pedir()
    }
    const soltar = (e: PointerEvent) => {
      const a = s.arrastre
      s.arrastre = null
      if (a && !a.movio) { const p = pisoEn(e.clientX, e.clientY); if (p) s.alElegir(p) }
    }
    canvas.addEventListener('pointerdown', bajarDedo)
    canvas.addEventListener('pointermove', mover)
    canvas.addEventListener('pointerup', soltar)
    canvas.addEventListener('pointercancel', soltar)
    return () => {
      vivo = false
      cancelAnimationFrame(cuadro)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', bajarDedo)
      canvas.removeEventListener('pointermove', mover)
      canvas.removeEventListener('pointerup', soltar)
      canvas.removeEventListener('pointercancel', soltar)
    }
  }, [])

  // Al elegir un piso se vuelve a dibujar la marca
  useEffect(() => { estado.current.pedir() }, [piso])

  return (
    <div className="relative">
      <canvas
        ref={lienzo} role="img" aria-label={`Torre Umbral girando, con el piso ${piso} marcado`}
        className="block aspect-[4/5] w-full cursor-grab touch-pan-y rounded-[var(--radius-tarjeta)] bg-tinta select-none sm:aspect-[16/9]"
      />
      <p className="dato pointer-events-none absolute top-3 left-3 rounded-[4px] bg-tinta/80 px-2 py-1 text-papel" aria-hidden="true">↔ Arrastra para girar · toca un piso</p>
      <p className="dato pointer-events-none absolute right-3 bottom-3 rounded-[4px] bg-atardecer px-2 py-1 text-tinta" aria-hidden="true">Piso {piso}</p>
      {listos < CUADROS && (
        <p className="dato pointer-events-none absolute bottom-3 left-3 rounded-[4px] bg-tinta/80 px-2 py-1 text-papel">Cargando la vuelta… {Math.round((listos / CUADROS) * 100)} %</p>
      )}
    </div>
  )
}

function dentro(x: number, y: number, poligono: number[][]) {
  let adentro = false
  for (let a = 0, b = poligono.length - 1; a < poligono.length; b = a++) {
    const [xa, ya] = poligono[a]
    const [xb, yb] = poligono[b]
    if (ya > y !== yb > y && x < ((xb - xa) * (y - ya)) / (yb - ya) + xa) adentro = !adentro
  }
  return adentro
}
