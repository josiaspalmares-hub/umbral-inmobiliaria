import { PISOS } from '@/lib/torre'
import { useEffect, useRef, useState } from 'react'

// Torre que gira (toma de dron de costado a costado) con el piso elegido marcado encima
const CUADROS = 59 // cada cuadro equivale a 2 cuadros del video unido (118)
const ANCHO_VIDEO = 1280
const ALTO_VIDEO = 720
const ULTIMO = PISOS.length // 8 pisos de apartamentos
const FRENTE = 40 // cuadro donde la torre se ve de frente: ahí empieza

// Cada cara: [x izquierda, x derecha, techo del piso 8 a la izq., piso del 1 a la izq., techo a la der., piso a la der.]
type Cara = [xa: number, xb: number, ta: number, ba: number, tb: number, bb: number]
type Clave = { cuadro: number; caras: [Cara, Cara] }

// Losas ajustadas automáticamente sobre el concreto en 13 cuadros del video unido (1280 × 720) y revisadas a la vista
const CLAVES: Clave[] = [
  { cuadro: 0, caras: [[435, 720, 114, 555, 81, 549], [720, 870, 73, 556, 135, 528]] },
  { cuadro: 10, caras: [[470, 708, 117, 529, 79, 557], [708, 900, 65, 562, 132, 527]] },
  { cuadro: 20, caras: [[500, 680, 90, 539, 79, 558], [680, 915, 60, 565, 122, 531]] },
  { cuadro: 30, caras: [[495, 650, 102, 536, 78, 558], [650, 925, 96, 565, 137, 538]] },
  { cuadro: 40, caras: [[505, 610, 78, 542, 78, 558], [610, 905, 54, 567, 100, 541]] },
  { cuadro: 50, caras: [[510, 560, 86, 545, 76, 555], [560, 885, 62, 562, 84, 548]] },
  { cuadro: 60, caras: [[515, 520, 64, 550, 64, 550], [520, 865, 70, 556, 72, 555]] },
  { cuadro: 70, caras: [[490, 690, 74, 553, 69, 557], [690, 840, 61, 563, 66, 556]] },
  { cuadro: 79, caras: [[465, 800, 70, 557, 65, 557], [800, 825, 79, 554, 85, 548]] },
  { cuadro: 90, caras: [[436, 740, 91, 546, 56, 560], [740, 855, 72, 550, 180, 511]] },
  { cuadro: 100, caras: [[410, 685, 100, 545, 53, 555], [685, 870, 51, 562, 175, 511]] },
  { cuadro: 110, caras: [[407, 611, 109, 544, 50, 558], [611, 891, 50, 567, 163, 517]] },
  { cuadro: 117, caras: [[405, 560, 133, 534, 44, 568], [560, 905, 62, 562, 142, 532]] },
]

function carasEn(cuadroVideo: number): [Cara, Cara] {
  const k = CLAVES.findIndex((c) => c.cuadro >= cuadroVideo)
  if (k <= 0) return CLAVES[Math.max(k, 0)].caras
  const a = CLAVES[k - 1]
  const b = CLAVES[k]
  const t = (cuadroVideo - a.cuadro) / (b.cuadro - a.cuadro)
  return a.caras.map((ca, i) => ca.map((v, j) => v + (b.caras[i][j] - v) * t)) as [Cara, Cara]
}

// Las dos caras del piso n como polígonos (en coordenadas del video)
function carasDelPiso(piso: number, caras: [Cara, Cara]) {
  const arriba = ULTIMO - piso
  return caras.filter(([xa, xb]) => xb - xa > 4).map(([xa, xb, ta, ba, tb, bb]) => {
    const ya = (n: number) => ta + ((ba - ta) * n) / ULTIMO
    const yb = (n: number) => tb + ((bb - tb) * n) / ULTIMO
    return [[xa, ya(arriba)], [xb, yb(arriba)], [xb, yb(arriba + 1)], [xa, ya(arriba + 1)]]
  })
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
    const tactil = matchMedia('(pointer: coarse)').matches
    const carpeta = !tactil && innerWidth * Math.min(devicePixelRatio, 2) >= 1400 ? 'hd' : 'sd'
    const imgs: (HTMLImageElement | null)[] = Array(CUADROS).fill(null)
    let vivo = true
    // Primero el cuadro de frente, luego los más cercanos a él
    const orden = Array.from({ length: CUADROS }, (_, k) => k).sort((a, b) => Math.abs(a - FRENTE) - Math.abs(b - FRENTE))
    let siguiente = 0
    const bajar = () => {
      const k = orden[siguiente++]
      if (k === undefined || !vivo) return
      const img = new Image()
      // Decodificada en segundo plano antes de mostrarla, para que arrastrar no se trabe
      const lista = () => { imgs[k] = img; if (vivo) { setListos((n) => n + 1); pedir() } bajar() }
      img.onload = () => img.decode().then(lista, (error: Error) => { console.warn(`No se pudo preparar el cuadro ${k}:`, error.message); lista() })
      img.onerror = () => { console.warn(`No cargó el cuadro ${k} de la vuelta`); bajar() }
      img.src = ruta(carpeta, k)
    }
    // Empieza a bajar los cuadros cuando la sección se acerca a la pantalla
    const cerca = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      cerca.disconnect()
      for (let n = 0; n < 4; n++) bajar()
    }, { rootMargin: '900px 0px' })
    cerca.observe(canvas)

    // Encuadre: en pantallas angostas se recorta en vertical siguiendo al edificio
    const ventana = (caras: [Cara, Cara]) => {
      const { width: w, height: h } = canvas
      const escala = h / ALTO_VIDEO
      const anchoVisible = w / escala
      if (anchoVisible >= ANCHO_VIDEO) return { escala: w / ANCHO_VIDEO, x0: 0, y0: (h - ALTO_VIDEO * (w / ANCHO_VIDEO)) / 2 }
      const centro = (caras[0][0] + caras[1][1]) / 2
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
      const caras = carasEn(k * 2)
      const v = ventana(caras)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, v.x0, v.y0, ANCHO_VIDEO * v.escala, ALTO_VIDEO * v.escala)
      // Piso elegido: relleno arcilla con borde de luz
      ctx.save()
      ctx.translate(v.x0, v.y0)
      ctx.scale(v.escala, v.escala)
      for (const cara of carasDelPiso(s.piso, caras)) {
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
      const dpr = Math.min(devicePixelRatio, tactil ? 1.5 : 2)
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
      const caras = carasEn(Math.round(s.i) * 2)
      const v = ventana(caras)
      const x = ((cx - r.left) * dpr - v.x0) / v.escala
      const y = ((cy - r.top) * dpr - v.y0) / v.escala
      return PISOS.find((p) => carasDelPiso(p, caras).some((cara) => dentro(x, y, cara)))
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
      cerca.disconnect()
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
