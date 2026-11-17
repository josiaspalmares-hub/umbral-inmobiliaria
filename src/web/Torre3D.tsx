import { useEffect, useRef } from 'react'
import {
  BoxGeometry, BufferGeometry, Color, EdgesGeometry, Float32BufferAttribute, Group, LineBasicMaterial,
  LineSegments, Mesh, MeshBasicMaterial, OrthographicCamera, Raycaster, Scene, Vector2, WebGLRenderer,
} from 'three'

// Torre en líneas con Three.js. Se carga aparte y solo en equipos que la aguantan.
type Props = {
  niveles: number
  elegibles: (i: number) => boolean
  agotados: number[]
  seleccionado: number
  alElegir: (i: number) => void
  alFallar: () => void
}

const ANCHO = 5
const FONDO = 4
const ALTO = 1
const TINTA = new Color('#1d2125')
const LADRILLO = new Color('#a3452a')
const CONCRETO = new Color('#bfb7a8')

function parteluces(niveles: number) {
  const pts: number[] = []
  const h = niveles * ALTO
  for (let x = -ANCHO / 2 + 1; x < ANCHO / 2; x += 1) pts.push(x, 0, FONDO / 2, x, h, FONDO / 2, x, 0, -FONDO / 2, x, h, -FONDO / 2)
  for (let z = -FONDO / 2 + 1; z < FONDO / 2; z += 1) pts.push(ANCHO / 2, 0, z, ANCHO / 2, h, z, -ANCHO / 2, 0, z, -ANCHO / 2, h, z)
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pts, 3))
  return g
}

export default function Torre3D({ niveles, elegibles, agotados, seleccionado, alElegir, alFallar }: Props) {
  const lienzo = useRef<HTMLCanvasElement>(null)
  const estado = useRef({ seleccionado, agotados, elegibles, alElegir })
  estado.current = { seleccionado, agotados, elegibles, alElegir }

  useEffect(() => {
    const canvas = lienzo.current
    if (!canvas) return
    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch (error) {
      console.warn('WebGL no disponible, se usa el dibujo simple:', error)
      alFallar()
      return
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))

    const escena = new Scene()
    const camara = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
    camara.position.set(16, 13, 16)
    camara.lookAt(0, niveles * ALTO * 0.5 - 0.6, 0)

    const torre = new Group()
    escena.add(torre)
    const caja = new BoxGeometry(ANCHO, ALTO, FONDO)
    const aristas = new EdgesGeometry(caja)
    const pisos: { relleno: Mesh; borde: LineSegments; mRelleno: MeshBasicMaterial; mBorde: LineBasicMaterial }[] = []
    for (let i = 0; i < niveles; i++) {
      const mRelleno = new MeshBasicMaterial({ color: LADRILLO, transparent: true, opacity: 0, depthWrite: false })
      const mBorde = new LineBasicMaterial({ color: TINTA, transparent: true, opacity: 0.85 })
      const relleno = new Mesh(caja, mRelleno)
      const borde = new LineSegments(aristas, mBorde)
      relleno.position.y = borde.position.y = i * ALTO + ALTO / 2
      relleno.userData.indice = i
      torre.add(relleno, borde)
      pisos.push({ relleno, borde, mRelleno, mBorde })
    }
    const mParteluz = new LineBasicMaterial({ color: TINTA, transparent: true, opacity: 0.22 })
    const gParteluz = parteluces(niveles)
    torre.add(new LineSegments(gParteluz, mParteluz))
    const gTecho = new EdgesGeometry(new BoxGeometry(2, 0.6, 1.6))
    const techo = new LineSegments(gTecho, pisos[0].mBorde)
    techo.position.set(0, niveles * ALTO + 0.3, 0)
    torre.add(techo)

    const ajustar = () => {
      const { clientWidth: w, clientHeight: h } = canvas
      if (!w || !h) return
      renderer.setSize(w, h, false)
      const mitad = niveles * 0.62
      const aspecto = w / h
      camara.left = -mitad * aspecto; camara.right = mitad * aspecto; camara.top = mitad; camara.bottom = -mitad
      camara.updateProjectionMatrix()
    }
    ajustar()
    const ro = new ResizeObserver(ajustar)
    ro.observe(canvas)

    // Interacción: arrastrar gira la torre; un toque sin arrastre elige el piso
    const rayo = new Raycaster()
    const puntero = new Vector2()
    let encima = -1
    let arrastre: { x: number; giro: number; movio: boolean } | null = null
    let giro = -0.35

    const pisoBajo = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      puntero.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      rayo.setFromCamera(puntero, camara)
      const hit = rayo.intersectObjects(pisos.map((p) => p.relleno))[0]
      return hit ? (hit.object.userData.indice as number) : -1
    }
    const bajar = (e: PointerEvent) => { arrastre = { x: e.clientX, giro, movio: false } }
    const mover = (e: PointerEvent) => {
      if (arrastre && e.buttons) {
        const dx = e.clientX - arrastre.x
        if (Math.abs(dx) > 5) arrastre.movio = true
        if (arrastre.movio) giro = arrastre.giro + dx * 0.008
        return
      }
      const i = pisoBajo(e)
      encima = i >= 0 && estado.current.elegibles(i) ? i : -1
      canvas.style.cursor = encima >= 0 ? 'pointer' : 'grab'
    }
    const soltar = (e: PointerEvent) => {
      if (arrastre && !arrastre.movio) {
        const i = pisoBajo(e)
        if (i >= 0 && estado.current.elegibles(i)) estado.current.alElegir(i)
      }
      arrastre = null
    }
    const salir = () => { encima = -1 }
    canvas.addEventListener('pointerdown', bajar)
    canvas.addEventListener('pointermove', mover)
    canvas.addEventListener('pointerup', soltar)
    canvas.addEventListener('pointerleave', salir)

    const perdido = (e: Event) => { e.preventDefault(); alFallar() }
    canvas.addEventListener('webglcontextlost', perdido)

    // Solo se anima mientras se ve en pantalla
    let visible = false
    let cuadro = 0
    // Con "menos movimiento" la torre aparece completa y no gira sola
    const quieta = matchMedia('(prefers-reduced-motion: reduce)').matches
    const inicio = performance.now() - (quieta ? 10000 : 0)
    const dibujar = (t: number) => {
      cuadro = visible ? requestAnimationFrame(dibujar) : 0
      const avance = Math.min((t - inicio) / 1400, 1)
      const { seleccionado: sel, agotados: ago } = estado.current
      pisos.forEach((p, i) => {
        const aparece = Math.min(Math.max(avance * niveles * 1.3 - i, 0), 1)
        p.borde.scale.y = p.relleno.scale.y = Math.max(aparece, 0.001)
        p.mBorde.opacity = 0.85 * aparece
        const esSel = i === sel
        const esAgo = ago.includes(i)
        p.mRelleno.color.copy(esAgo && !esSel ? CONCRETO : LADRILLO)
        p.mRelleno.opacity = (esSel ? 0.5 : i === encima ? 0.18 : esAgo ? 0.35 : 0) * aparece
        p.mBorde.color.copy(esSel ? LADRILLO : TINTA)
      })
      if (!arrastre && !quieta) giro += 0.0018
      torre.rotation.y = giro
      renderer.render(escena, camara)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !document.hidden
      if (visible && !cuadro) cuadro = requestAnimationFrame(dibujar)
    })
    io.observe(canvas)

    return () => {
      cancelAnimationFrame(cuadro)
      io.disconnect(); ro.disconnect()
      canvas.removeEventListener('pointerdown', bajar)
      canvas.removeEventListener('pointermove', mover)
      canvas.removeEventListener('pointerup', soltar)
      canvas.removeEventListener('pointerleave', salir)
      canvas.removeEventListener('webglcontextlost', perdido)
      pisos.forEach((p) => { p.mRelleno.dispose(); p.mBorde.dispose() })
      caja.dispose(); aristas.dispose(); gParteluz.dispose(); mParteluz.dispose(); gTecho.dispose()
      renderer.dispose()
    }
  }, [niveles, alFallar])

  return <canvas ref={lienzo} aria-hidden="true" className="block h-full w-full touch-pan-y" />
}
