import { ETAPAS } from '@/torre/modelo'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

// Mírala crecer: el video de la obra (cortado en cuadros) avanza con el scroll y termina en la torre real
const CUADROS = 60
const FIN_VIDEO = 0.84 // después de esto se funde con la foto de la torre terminada
// Dónde empieza cada etapa dentro del video (0 a 1), según lo que se ve en cada momento
const LIMITES = [0, 0.07, 0.17, 0.42, 0.55, 0.66]

const etapaEn = (t: number) => {
  const enVideo = Math.min(t / FIN_VIDEO, 1)
  return LIMITES.reduce((i, inicio, k) => (enVideo >= inicio ? k : i), 0)
}

function cargarCuadros(carpeta: 'hd' | 'pc' | 'tel', pocos: boolean, alCargar: () => void) {
  const lista: (HTMLImageElement | null)[] = Array(CUADROS).fill(null)
  // Con ahorro de datos solo se bajan 10 cuadros; el resto se rellena con el más cercano
  const orden = Array.from({ length: CUADROS }, (_, i) => i).filter((i) => !pocos || i % 6 === 0 || i === CUADROS - 1)
  let siguiente = 0
  const bajar = () => {
    const i = orden[siguiente++]
    if (i === undefined) return
    const img = new Image()
    img.decoding = 'async'
    // Se decodifica en segundo plano antes de usarla; así dibujarla no congela la pantalla
    img.onload = () => {
      img.decode().then(
        () => { lista[i] = img; alCargar(); bajar() },
        (error: Error) => { console.warn(`No se pudo preparar el cuadro ${i + 1}:`, error.message); lista[i] = img; alCargar(); bajar() },
      )
    }
    const archivo = (c: string) => `/img/obra-video/${c}/${String(i + 1).padStart(2, '0')}.webp`
    // Si falta el cuadro HD, se usa el normal; nunca queda la pantalla en negro
    img.onerror = () => {
      if (carpeta === 'hd' && !img.src.includes('/pc/')) { img.src = archivo('pc'); return }
      console.warn(`No cargó el cuadro ${i + 1} de la obra`)
      bajar()
    }
    img.src = archivo(carpeta)
  }
  for (let n = 0; n < 4; n++) bajar() // cuatro descargas a la vez
  return lista
}

function cercano(lista: (HTMLImageElement | null)[], i: number) {
  for (let d = 0; d < lista.length; d++) {
    if (lista[i - d]) return lista[i - d]
    if (lista[i + d]) return lista[i + d]
  }
  return null
}

export function Obra() {
  const caja = useRef<HTMLElement>(null)
  const lienzo = useRef<HTMLCanvasElement>(null)
  const barra = useRef<HTMLElement>(null)
  const final = useRef<HTMLImageElement>(null)
  // Solo se vuelve a pintar el texto cuando cambia el porcentaje o la etapa, no en cada cuadro
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const el = caja.current
    const canvas = lienzo.current
    if (!el || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let cuadros: (HTMLImageElement | null)[] = []
    let progreso = 0
    let pendiente = false
    let dibujado: HTMLImageElement | null = null
    let tamano = ''

    const dibujar = () => {
      pendiente = false
      const recorrido = el.offsetHeight - innerHeight
      progreso = Math.min(Math.max(-el.getBoundingClientRect().top / recorrido, 0), 1)
      setPct(Math.round(progreso * 100))
      if (barra.current) barra.current.style.transform = `scaleX(${progreso})`
      if (final.current) final.current.style.opacity = String(Math.min(Math.max((progreso - FIN_VIDEO) / (1 - FIN_VIDEO - 0.04), 0), 1))
      const img = cercano(cuadros, Math.round(Math.min(progreso / FIN_VIDEO, 1) * (CUADROS - 1)))
      // Si el cuadro es el mismo que ya está en pantalla, no se vuelve a dibujar
      const clave = `${canvas.width}x${canvas.height}`
      if (!img || (img === dibujado && clave === tamano)) return
      dibujado = img
      tamano = clave
      const { width: w, height: h } = canvas
      const escala = Math.max(w / img.naturalWidth, h / img.naturalHeight) // como object-fit: cover
      const dw = img.naturalWidth * escala
      const dh = img.naturalHeight * escala
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
    }
    const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(dibujar) } }

    const ajustar = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(devicePixelRatio, matchMedia('(pointer: coarse)').matches ? 1.5 : 2)
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
      pedir()
    }

    // Los cuadros se bajan cuando la sección se acerca, no al abrir la página
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || cuadros.length) return
      io.disconnect()
      const red = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
      const pocos = Boolean(red?.saveData || /2g|3g/.test(red?.effectiveType ?? ''))
      // Teléfono: cuadros verticales livianos; pantalla grande (1600 px o más con buena red): versión HD
      const vertical = innerHeight > innerWidth
      const carpeta = vertical ? 'tel' : innerWidth * Math.min(devicePixelRatio, 2) >= 1600 && !pocos ? 'hd' : 'pc'
      cuadros = cargarCuadros(carpeta, pocos, pedir)
    }, { rootMargin: '1200px 0px' })
    io.observe(el)

    ajustar()
    const ro = new ResizeObserver(ajustar)
    ro.observe(canvas)
    addEventListener('scroll', pedir, { passive: true })
    return () => { io.disconnect(); ro.disconnect(); removeEventListener('scroll', pedir) }
  }, [])

  const t = pct / 100
  const i = etapaEn(t)

  return (
    <section ref={caja} id="obra" className="relative h-[600vh] bg-tinta text-papel" aria-labelledby="obra-titulo">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <canvas ref={lienzo} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <picture>
          <source media="(orientation: portrait)" srcSet="/img/umbral/torre-alta-540.webp 540w, /img/umbral/torre-alta-900.webp 900w" sizes="100vw" />
          <img
            src="/img/umbral/esquina-1280.webp" srcSet="/img/umbral/esquina-1280.webp 1280w, /img/umbral/esquina-1920.webp 1920w" sizes="100vw"
            ref={final} alt="" loading="lazy" decoding="async" width={1920} height={1072}
            className="absolute inset-0 h-full w-full object-cover opacity-0"
          />
        </picture>
        {/* Degradado para que el texto se lea sobre el video */}
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(27_29_31/0.92)_0%,rgb(27_29_31/0.35)_45%,transparent_70%)] md:bg-[linear-gradient(90deg,rgb(27_29_31/0.9)_0%,rgb(27_29_31/0.55)_32%,transparent_60%)]" aria-hidden="true" />

        <div className="contenedor relative flex h-full flex-col justify-end pb-10 md:justify-center md:pb-0">
          <h2 id="obra-titulo" className="dato text-concreto">Mírala crecer · Torre Umbral</h2>
          <p className="dato mt-4 text-base text-atardecer" aria-hidden="true">{String(i + 1).padStart(2, '0')} / 06</p>
          <p className="titular mt-1 text-5xl italic md:text-7xl" aria-live="polite">{ETAPAS[i].nombre}</p>
          <p className="mt-3 max-w-[34ch] text-[#e6e1d8] md:min-h-[3.4em] md:text-lg">{ETAPAS[i].texto}</p>
          <p className="dato mt-5 text-concreto">Avance de obra <b className="ml-1 font-sans text-2xl text-papel">{pct} %</b></p>
          <div className="mt-3 h-[3px] w-full max-w-[360px] bg-papel/20"><i ref={barra} className="block h-full origin-left scale-x-0 bg-ladrillo" /></div>
          <ol className="dato mt-6 hidden gap-1.5 md:grid">
            {ETAPAS.map((e, k) => (
              <li key={e.nombre} className={cn(k === i ? 'text-papel' : k < i ? 'text-concreto' : 'text-papel/40')}>{String(k + 1).padStart(2, '0')} {e.nombre}</li>
            ))}
          </ol>
        </div>
        <p className={cn('dato absolute right-4 bottom-4 text-papel/60 transition-opacity md:right-8', t > 0.02 && 'opacity-0')} aria-hidden="true">Baja para verla crecer ↓</p>
      </div>
    </section>
  )
}
