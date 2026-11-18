import {
  ACESFilmicToneMapping, BoxGeometry, Color, DirectionalLight, HemisphereLight, InstancedMesh, MathUtils, Mesh, EdgesGeometry, LineBasicMaterial, LineSegments,
  MeshBasicMaterial, MeshStandardMaterial, Object3D, PCFSoftShadowMap, PerspectiveCamera, PMREMGenerator, Scene,
  SRGBColorSpace, WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { ALTO_PISO, ANCHO, COLORES, construirTorre, FONDO, PISOS, type Voxel } from './modelo'

export type Torre = { progreso: (t: number) => void; resaltar: (piso: number | null) => void; destruir: () => void }
type Opciones = { autoGiro?: boolean; sombras?: boolean; alFallar?: () => void }

const CAIDA = 6 // cuánto cae cada cubo antes de asentarse
const DURACION = 0.22 // fracción de etapa que tarda un cubo en asentarse

const suave = (a: number) => 1 - Math.pow(1 - a, 3)

function grupo(voxeles: Voxel[], material: MeshStandardMaterial | MeshBasicMaterial, tam: number) {
  const malla = new InstancedMesh(new BoxGeometry(tam, tam, tam), material, voxeles.length)
  const color = new Color()
  voxeles.forEach((v, i) => {
    const tonos = COLORES[v.material]
    color.set(tonos[(v.x * 7 + v.y * 13 + v.z * 3) % tonos.length])
    malla.setColorAt(i, color)
  })
  return malla
}

export function crearTorre(canvas: HTMLCanvasElement, { autoGiro = true, sombras = true, alFallar }: Opciones = {}): Torre {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95
  renderer.shadowMap.enabled = sombras
  renderer.shadowMap.type = PCFSoftShadowMap

  const escena = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const entorno = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  const alto = PISOS * ALTO_PISO
  const camara = new PerspectiveCamera(28, 1, 1, 600)
  camara.position.set(58, 46, 62)
  const controles = new OrbitControls(camara, canvas)
  controles.target.set(0, alto * 0.42, 0)
  controles.enableDamping = true
  controles.enablePan = false
  controles.enableZoom = false
  controles.minPolarAngle = 0.6
  controles.maxPolarAngle = 1.35
  controles.autoRotate = autoGiro
  controles.autoRotateSpeed = 0.45

  const cielo = new HemisphereLight('#f7dcc0', '#5a4b3f', 0.75)
  const sol = new DirectionalLight('#ffd3a3', 1.9)
  sol.position.set(-40, 60, 30)
  sol.castShadow = sombras
  sol.shadow.mapSize.set(2048, 2048)
  Object.assign(sol.shadow.camera, { left: -44, right: 44, top: 58, bottom: -30, near: 1, far: 220 })
  sol.shadow.bias = -0.0006
  escena.add(cielo, sol)

  const todos = construirTorre()
  const solidos = todos.filter((v) => v.material !== 'vidrio' && v.material !== 'luz')
  const vidrios = todos.filter((v) => v.material === 'vidrio')
  const luces = todos.filter((v) => v.material === 'luz')

  const mSolido = new MeshStandardMaterial({ roughness: 0.82, metalness: 0 })
  const mVidrio = new MeshStandardMaterial({ roughness: 0.08, metalness: 0.3, envMap: entorno, envMapIntensity: 0.9 })
  const mLuz = new MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0 })
  const capas = [
    { voxeles: solidos, malla: grupo(solidos, mSolido, 0.96) },
    { voxeles: vidrios, malla: grupo(vidrios, mVidrio, 0.9) },
    { voxeles: luces, malla: grupo(luces, mLuz, 0.92) },
  ]
  for (const c of capas) {
    c.malla.castShadow = sombras && c.voxeles === solidos
    c.malla.receiveShadow = sombras
    escena.add(c.malla)
  }

  // Piso elegido: una caja de vidrio color arcilla alrededor de ese nivel
  const mResalte = new MeshBasicMaterial({ color: '#ff8a4c', transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false })
  const gResalte = new BoxGeometry(ANCHO + 1.4, ALTO_PISO - 0.2, FONDO + 2.4)
  const resalte = new Mesh(gResalte, mResalte)
  const mBorde = new LineBasicMaterial({ color: '#ffd29a', toneMapped: false })
  const gBorde = new EdgesGeometry(gResalte)
  resalte.add(new LineSegments(gBorde, mBorde))
  resalte.visible = false
  escena.add(resalte)

  const ficticio = new Object3D()
  const centroX = ANCHO / 2 - 0.5
  const centroZ = FONDO / 2 - 0.5
  let t = 0
  let cambio = true

  const colocar = () => {
    for (const { voxeles, malla } of capas) {
      voxeles.forEach((v, i) => {
        const inicio = v.etapa + v.orden * (1 - DURACION)
        const a = MathUtils.clamp((t - inicio) / DURACION, 0, 1)
        const e = suave(a)
        ficticio.position.set(v.x - centroX, v.y + 0.5 + (1 - e) * CAIDA, v.z - centroZ)
        ficticio.scale.setScalar(a === 0 ? 0.0001 : 0.35 + 0.65 * e)
        ficticio.updateMatrix()
        malla.setMatrixAt(i, ficticio.matrix)
      })
      malla.instanceMatrix.needsUpdate = true
    }
    // La última etapa pasa al atardecer: baja el sol y se encienden las ventanas
    const noche = MathUtils.clamp(t - 5, 0, 1)
    sol.intensity = 1.9 - noche * 0.8
    sol.color.set('#ffd3a3').lerp(new Color('#ff9a62'), noche)
    cielo.intensity = 0.75 - noche * 0.15
    mLuz.opacity = noche
    cambio = false
  }

  const ajustar = () => {
    const { clientWidth: w, clientHeight: h } = canvas
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camara.aspect = w / h
    // En pantallas angostas la cámara se aleja para que la torre entre completa
    camara.position.setLength(w / h < 0.8 ? 172 : 142)
    camara.updateProjectionMatrix()
  }
  ajustar()
  const ro = new ResizeObserver(ajustar)
  ro.observe(canvas)

  let visible = false
  let cuadro = 0
  const dibujar = () => {
    cuadro = visible ? requestAnimationFrame(dibujar) : 0
    if (cambio) colocar()
    controles.update()
    renderer.render(escena, camara)
  }
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (visible && !cuadro) cuadro = requestAnimationFrame(dibujar)
  })
  io.observe(canvas)

  const perdido = (e: Event) => { e.preventDefault(); alFallar?.() }
  canvas.addEventListener('webglcontextlost', perdido)

  return {
    resaltar(piso) {
      resalte.visible = piso !== null
      if (piso !== null) resalte.position.set(0, piso * ALTO_PISO + (ALTO_PISO + 1) / 2, 0.5)
    },
    progreso(nuevo) {
      const limitado = MathUtils.clamp(nuevo, 0, 6)
      if (limitado !== t) { t = limitado; cambio = true }
    },
    destruir() {
      cancelAnimationFrame(cuadro)
      io.disconnect(); ro.disconnect(); controles.dispose()
      canvas.removeEventListener('webglcontextlost', perdido)
      for (const { malla } of capas) { malla.geometry.dispose(); malla.dispose() }
      mSolido.dispose(); mVidrio.dispose(); mLuz.dispose(); mResalte.dispose(); gResalte.dispose(); mBorde.dispose(); gBorde.dispose(); entorno.dispose(); pmrem.dispose()
      renderer.dispose()
    },
  }
}
