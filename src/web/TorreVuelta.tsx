import { PISOS } from '@/lib/torre'
import { useEffect, useRef, useState } from 'react'

// Torre que gira (toma de dron de costado a costado) con una columna de pisos al costado
const CUADROS = 59 // cada cuadro equivale a 2 cuadros del video unido (118)
const ANCHO_VIDEO = 1280
const ALTO_VIDEO = 720
const FRENTE = 40 // cuadro donde la torre se ve de frente: ahí empieza

// Cada cara: [x izquierda, x derecha, techo del piso 8 a la izq., piso del 1 a la izq., techo a la der., piso a la der.]
type Cara = [xa: number, xb: number, ta: number, ba: number, tb: number, bb: number, x8?: number]
// En la cara izquierda, x8 es donde empieza el piso 8: el ala de la izquierda tiene un piso menos
type Clave = { cuadro: number; caras: [Cara, Cara] }

// Techo del piso 8 y piso del 1 medidos a mano en 13 cuadros del video unido (1280 × 720);
// sirven para encuadrar y para pegar la columna de pisos al borde derecho
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

// Borde derecho de la torre: de techo del piso 8 a piso del 1 (en coordenadas del video)
const bordeDerecho = (caras: [Cara, Cara]) => ({ x: caras[1][1], arriba: caras[1][4], abajo: caras[1][5] })

const ruta = (carpeta: string, i: number) => `/img/vuelta/${carpeta}/${String(i).padStart(2, '0')}.webp`

export function TorreVuelta({ piso }: { piso: number }) {
  const lienzo = useRef<HTMLCanvasElement>(null)
  const marca = useRef<HTMLDivElement>(null)
  const estado = useRef({ piso, i: FRENTE, arrastre: null as null | { x: number; desde: number }, pedir: () => {} })
  estado.current.piso = piso
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

    // Se dibuja solo cuando algo cambia: al arrastrar o al cargar un cuadro
    let cuadro = 0
    const dibujar = () => {
      cuadro = 0
      // Mientras cargan, se muestra el cuadro listo más cercano
      const k = cuadroListo(Math.round(s.i))
      if (k === null) return
      const caras = carasEn(k * 2)
      const v = ventana(caras)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(imgs[k]!, v.x0, v.y0, ANCHO_VIDEO * v.escala, ALTO_VIDEO * v.escala)
      // La columna es HTML encima del lienzo: sigue el borde con transform y el bombillo late con CSS
      const m = marca.current
      if (m) {
        const ancho = canvas.getBoundingClientRect().width
        const dpr = canvas.width / ancho
        const b = bordeDerecho(caras)
        const x = Math.min((b.x * v.escala + v.x0) / dpr + 10, ancho - 16)
        const arriba = (b.arriba * v.escala + v.y0) / dpr
        m.style.transform = `translate(${x}px, ${arriba}px)`
        m.style.height = `${((b.abajo - b.arriba) * v.escala) / dpr}px`
        // Si no cabe la etiqueta a la derecha, va del lado de la torre
        m.dataset.lado = x + 100 > ancho ? 'izq' : 'der'
        m.hidden = false
      }
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

    const bajarDedo = (e: PointerEvent) => { s.arrastre = { x: e.clientX, desde: s.i }; canvas.setPointerCapture(e.pointerId) }
    const mover = (e: PointerEvent) => {
      const a = s.arrastre
      if (!a) return
      const dx = e.clientX - a.x
      s.i = Math.min(Math.max(a.desde - (dx / canvas.getBoundingClientRect().width) * CUADROS * 1.1, 0), CUADROS - 1)
      pedir()
    }
    const soltar = () => { s.arrastre = null }
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

  // Al elegir un piso el bombillo se mueve
  useEffect(() => { estado.current.pedir() }, [piso])

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-tarjeta)]">
      <canvas
        ref={lienzo} role="img" aria-label={`Torre Umbral girando, con el piso ${piso} marcado`}
        className="block aspect-[4/5] w-full cursor-grab touch-pan-y bg-tinta select-none active:cursor-grabbing sm:aspect-[16/9]"
      />
      <div ref={marca} hidden data-lado="der" className="group pointer-events-none absolute top-0 left-0 flex w-0 flex-col will-change-transform" aria-hidden="true">
        {[...PISOS].reverse().map((p) => (
          <div key={p} className="relative flex flex-1 items-center">
            {p === piso ? (
              <>
                <span className="bombillo -ml-[7px] shrink-0" />
                <span className="dato absolute left-4 rounded-[4px] bg-tinta/85 px-2 py-1 whitespace-nowrap text-papel group-data-[lado=izq]:right-4 group-data-[lado=izq]:left-auto">Piso {p}</span>
              </>
            ) : (
              <span className="-ml-[3px] size-1.5 shrink-0 rounded-full bg-papel/70 shadow-[0_0_0_1px_rgba(31,29,27,0.35)]" />
            )}
          </div>
        ))}
      </div>
      <p className="dato pointer-events-none absolute top-3 left-3 rounded-[4px] bg-tinta/80 px-2 py-1 text-papel" aria-hidden="true">↔ Arrastra para girar</p>
      {listos < CUADROS && (
        <p className="dato pointer-events-none absolute bottom-3 left-3 rounded-[4px] bg-tinta/80 px-2 py-1 text-papel">Cargando la vuelta… {Math.round((listos / CUADROS) * 100)} %</p>
      )}
    </div>
  )
}
