import { PISOS } from '@/lib/torre'
import { useEffect, useRef, useState } from 'react'

// Torre que gira (toma de dron de costado a costado) con el piso elegido marcado encima
const CUADROS = 59 // cada cuadro equivale a 2 cuadros del video unido (118)
const ANCHO_VIDEO = 1280
const ALTO_VIDEO = 720
const ULTIMO = PISOS.length // 8 pisos de apartamentos
const FRENTE = 40 // cuadro donde la torre se ve de frente: ahí empieza

// Cada cara: [x izquierda, x derecha, techo del piso 8 a la izq., piso del 1 a la izq., techo a la der., piso a la der.]
type Cara = [xa: number, xb: number, ta: number, ba: number, tb: number, bb: number, x8?: number]
// En la cara izquierda, x8 es donde empieza el piso 8: el ala de la izquierda tiene un piso menos
type Clave = { cuadro: number; caras: [Cara, Cara] }

// Techo del piso 8 y piso del 1 medidos a mano con zoom en 13 cuadros del video unido (1280 × 720);
// los pisos intermedios se reparten entre esas dos líneas y se revisaron pintándolos en colores alternos
const CLAVES: Clave[] = [
  { cuadro: 0, caras: [[435, 720, 110, 546, 110, 546, 435], [720, 870, 90, 551, 130, 532]] },
  { cuadro: 10, caras: [[470, 708, 113, 548, 82, 548, 530], [708, 900, 84, 558, 128, 545]] },
  { cuadro: 20, caras: [[500, 680, 114, 552, 85, 552, 560], [680, 915, 82, 562, 120, 548]] },
  { cuadro: 30, caras: [[495, 650, 125, 555, 88, 555, 555], [650, 925, 82, 568, 120, 555]] },
  { cuadro: 40, caras: [[505, 610, 111, 553, 75, 553, 585], [610, 905, 75, 570, 100, 562]] },
  { cuadro: 50, caras: [[510, 560, 90, 555, 80, 560, 545], [560, 885, 80, 560, 82, 562]] },
  { cuadro: 60, caras: [[515, 520, 80, 560, 80, 560, 515], [520, 865, 80, 560, 80, 560]] },
  { cuadro: 70, caras: [[490, 690, 80, 560, 80, 560, 490], [690, 840, 80, 560, 80, 560]] },
  { cuadro: 79, caras: [[465, 800, 80, 560, 80, 560, 465], [800, 825, 82, 558, 86, 552]] },
  { cuadro: 90, caras: [[436, 740, 108, 550, 75, 565, 436], [740, 855, 72, 555, 170, 518]] },
  { cuadro: 100, caras: [[410, 685, 122, 548, 65, 563, 410], [685, 870, 68, 560, 160, 513]] },
  { cuadro: 110, caras: [[407, 611, 132, 545, 57, 566, 407], [611, 891, 62, 565, 150, 522]] },
  { cuadro: 117, caras: [[405, 560, 138, 545, 63, 568, 405], [560, 905, 65, 566, 140, 532]] },
]

function carasEn(cuadroVideo: number): [Cara, Cara] {
  const k = CLAVES.findIndex((c) => c.cuadro >= cuadroVideo)
  if (k <= 0) return CLAVES[Math.max(k, 0)].caras
  const a = CLAVES[k - 1]
  const b = CLAVES[k]
  const t = (cuadroVideo - a.cuadro) / (b.cuadro - a.cuadro)
  return a.caras.map((ca, i) => (ca as number[]).map((v, j) => v + ((b.caras[i] as number[])[j] - v) * t)) as [Cara, Cara]
}

// Las dos caras del piso n como polígonos (en coordenadas del video)
function carasDelPiso(piso: number, caras: [Cara, Cara]) {
  const arriba = ULTIMO - piso
  return caras.filter(([xa, xb]) => xb - xa > 4).map(([xa, xb, ta, ba, tb, bb, x8]) => {
    const ya = (n: number) => ta + ((ba - ta) * n) / ULTIMO
    const yb = (n: number) => tb + ((bb - tb) * n) / ULTIMO
    // El piso 8 no pasa sobre el ala baja: se recorta desde x8, siguiendo la misma línea de losa
    const xi = piso === ULTIMO && x8 !== undefined ? Math.min(x8, xb - 4) : xa
    const enX = (n: number) => ya(n) + ((yb(n) - ya(n)) * (xi - xa)) / (xb - xa)
    return [[xi, enX(arriba)], [xb, yb(arriba)], [xb, yb(arriba + 1)], [xi, enX(arriba + 1)]]
  })
}

const ruta = (carpeta: string, i: number) => `/img/vuelta/${carpeta}/${String(i).padStart(2, '0')}.webp`

type Props = { piso: number; alElegir: (p: number) => void }

export function TorreVuelta({ piso, alElegir }: Props) {
  const lienzo = useRef<HTMLCanvasElement>(null)
  const estado = useRef({ piso, alElegir, i: FRENTE, arrastre: null as null | { x: number; desde: number; movio: boolean }, pedir: () => {}, mostrado: FRENTE })
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

    const cuadroListo = (k: number) => {
      for (let d = 0; d < CUADROS; d++) {
        if (imgs[k - d]) return k - d
        if (imgs[k + d]) return k + d
      }
      return null
    }

    // Se dibuja solo cuando algo cambia: al arrastrar, al elegir piso o al cargar un cuadro
    let cuadro = 0
    const dibujar = () => {
      cuadro = 0
      // Mientras cargan, se muestra el cuadro listo más cercano; la franja usa la forma de ESE cuadro
      const k = cuadroListo(Math.round(s.i))
      if (k === null) return
      const img = imgs[k]!
      s.mostrado = k
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
      const caras = carasEn(s.mostrado * 2)
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
