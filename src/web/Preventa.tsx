import { abrirMensaje } from '@/lib/mensaje'
import { bolivares, dolares, type EstadoTasa } from '@/lib/moneda'
import {
  disponiblesEnPiso, MESES_HASTA_ENTREGA, PISOS, PRIMER_PISO, planDePagos, TIPOS, ULTIMO_PISO, unidadesDelPiso,
} from '@/lib/torre'
import { cn } from '@/lib/utils'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Edificio } from './Edificio'
import { Plano } from './Plano'

const Torre3D = lazy(() => import('./Torre3D'))

const NIVELES = ULTIMO_PISO + 1 // planta baja (0) hasta el último piso
const INICIALES = [20, 30, 40]
const agotados = PISOS.filter((p) => disponiblesEnPiso(p) === 0)
const elegible = (i: number) => i >= PRIMER_PISO && i <= ULTIMO_PISO

// El 3D solo en equipos que lo aguantan; el resto ve el dibujo en SVG
const hayWebGL = () => {
  const prueba = document.createElement('canvas')
  return Boolean(prueba.getContext('webgl2') ?? prueba.getContext('webgl'))
}

function puede3D() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  const red = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  if (red?.saveData || /2g/.test(red?.effectiveType ?? '')) return false
  if ((navigator.hardwareConcurrency ?? 4) < 4) return false
  return hayWebGL()
}

export function Preventa({ tasa }: { tasa: EstadoTasa }) {
  const [piso, setPiso] = useState(6)
  const [codigo, setCodigo] = useState('6A')
  const [inicialPct, setInicialPct] = useState(30)
  const [modo3D, setModo3D] = useState(false)
  const [cerca, setCerca] = useState(false)
  const caja = useRef<HTMLDivElement>(null)

  useEffect(() => { setModo3D(puede3D()) }, [])

  // El 3D se descarga cuando la sección se acerca a la pantalla
  useEffect(() => {
    const el = caja.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setCerca(true); io.disconnect() } }, { rootMargin: '400px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const unidades = useMemo(() => unidadesDelPiso(piso), [piso])
  const unidad = unidades.find((u) => u.codigo === codigo) ?? unidades.find((u) => !u.vendido)
  const plan = unidad ? planDePagos(unidad.precio, inicialPct) : null

  const elegirPiso = useCallback((p: number) => {
    setPiso(p)
    const libre = unidadesDelPiso(p).find((u) => !u.vendido)
    setCodigo(libre?.codigo ?? '')
  }, [])
  const sinWebGL = useCallback(() => setModo3D(false), [])
  const bs = (n: number) => (tasa.tasa ? bolivares(n, tasa.tasa) : tasa.fallo ? 'Bs no disponible' : 'Calculando…')

  return (
    <section id="preventa" className="scroll-mt-16 bg-papel-2 py-16 md:py-24" aria-labelledby="preventa-titulo">
      <div className="contenedor">
        <p className="rotulo">Preventa · entrega en noviembre de 2028</p>
        <h2 id="preventa-titulo" className="titular mt-3 max-w-3xl text-5xl md:text-7xl">Torre Umbral: elige el piso y mira tu apartamento.</h2>
        <p className="mt-4 max-w-2xl text-lg text-tinta-2">
          48 apartamentos en Los Palos Grandes. Sin crédito bancario: pagas una inicial y el resto en {MESES_HASTA_ENTREGA} cuotas mientras se construye.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <div ref={caja} className="relative min-w-0">
            <div className="relative mx-auto aspect-square w-full max-w-[460px] sm:aspect-[4/5]">
              {modo3D && cerca ? (
                <Suspense fallback={<Edificio pisos={NIVELES} resaltado={piso} agotados={agotados} className="mx-auto h-full w-auto" />}>
                  <Torre3D niveles={NIVELES} elegibles={elegible} agotados={agotados} seleccionado={piso} alElegir={elegirPiso} alFallar={sinWebGL} />
                </Suspense>
              ) : (
                <Edificio pisos={NIVELES} resaltado={piso} agotados={agotados} alElegir={(i) => elegible(i) && elegirPiso(i)} className="mx-auto h-full w-auto" />
              )}
            </div>
            <p className="mt-2 text-center text-sm text-gris">
              {modo3D ? 'Arrastra para girar la torre y toca un piso.' : 'Toca un piso en el dibujo o en la lista.'}{' '}
              <button type="button" className="font-semibold text-tinta underline underline-offset-2" onClick={() => setModo3D((v) => !v && hayWebGL())}>
                {modo3D ? 'Ver dibujo simple' : 'Ver en 3D'}
              </button>
            </p>
          </div>

          <div className="min-w-0">
            <fieldset className="min-w-0">
              <legend className="rotulo mb-3">Piso</legend>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {PISOS.map((p) => {
                  const libres = disponiblesEnPiso(p)
                  return (
                    <button
                      key={p} type="button" onClick={() => elegirPiso(p)} aria-pressed={p === piso}
                      aria-label={`Piso ${p}, ${libres === 0 ? 'agotado' : `${libres} disponibles`}`}
                      className={cn('cifra flex min-h-[54px] flex-col items-center justify-center rounded-[var(--radius-campo)] border text-lg font-bold transition-colors',
                        p === piso ? 'border-ladrillo bg-ladrillo text-white' : 'border-concreto bg-white hover:border-tinta', libres === 0 && p !== piso && 'text-gris')}
                    >
                      {p}
                      <span className={cn('text-[0.7rem] font-semibold', p === piso ? 'text-white/85' : 'text-gris')}>{libres === 0 ? 'agotado' : `${libres} libres`}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <fieldset className="mt-6 min-w-0">
              <legend className="rotulo mb-3">Apartamentos del piso {piso}</legend>
              <div className="grid grid-cols-2 gap-2">
                {unidades.map((u) => {
                  const t = TIPOS[u.tipo]
                  const activo = u.codigo === unidad?.codigo
                  return (
                    <button
                      key={u.codigo} type="button" disabled={u.vendido} onClick={() => setCodigo(u.codigo)} aria-pressed={activo}
                      className={cn('min-h-[64px] rounded-[var(--radius-campo)] border p-3 text-left transition-colors',
                        u.vendido ? 'cursor-not-allowed border-dashed border-concreto text-gris' : activo ? 'border-tinta bg-tinta text-papel' : 'border-concreto bg-white hover:border-tinta')}
                    >
                      <span className="cifra block font-bold">{u.codigo} · {t.m2} m²</span>
                      <span className="block text-sm">{u.vendido ? 'Vendido' : `${t.habitaciones} hab. · ${dolares(u.precio)}`}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {unidad && plan ? (
              <div className="mt-6 rounded-[var(--radius-tarjeta)] bg-white p-4 md:p-6" aria-live="polite">
                <div className="grid gap-5">
                  <Plano tipo={unidad.tipo} className="mx-auto w-full max-w-[460px]" />
                  <div>
                    <p className="titular text-4xl">Apartamento {unidad.codigo}</p>
                    <p className="mt-1 text-tinta-2">{TIPOS[unidad.tipo].nota}.</p>
                    <p className="cifra mt-3 text-sm text-tinta-2">{TIPOS[unidad.tipo].habitaciones} hab. · {TIPOS[unidad.tipo].banos} baños · {TIPOS[unidad.tipo].m2} m² · 1 puesto</p>
                    <p className="cifra mt-3 text-3xl font-bold">{dolares(unidad.precio)}</p>
                    <p className="cifra text-sm text-gris">{bs(unidad.precio)}</p>
                  </div>
                </div>

                <fieldset className="mt-6 min-w-0 border-t border-concreto pt-5">
                  <legend className="rotulo float-left mb-3 w-full">¿Cuánto das de inicial?</legend>
                  <div className="clear-both grid grid-cols-3 gap-2">
                    {INICIALES.map((pct) => (
                      <label key={pct} className={cn('relative flex min-h-[46px] cursor-pointer items-center justify-center rounded-[var(--radius-campo)] border font-bold transition-colors', inicialPct === pct ? 'border-ladrillo bg-ladrillo/10 text-ladrillo-2' : 'border-concreto hover:border-tinta')}>
                        <input type="radio" name="inicial" value={pct} checked={inicialPct === pct} onChange={() => setInicialPct(pct)} className="solo-lector" />
                        {pct} %
                      </label>
                    ))}
                  </div>
                  <dl className="cifra mt-5 grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gris">Inicial</dt>
                      <dd className="text-xl font-bold">{dolares(plan.inicial)}</dd>
                      <dd className="text-xs text-gris">{bs(plan.inicial)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gris">{MESES_HASTA_ENTREGA} cuotas de</dt>
                      <dd className="text-xl font-bold text-ladrillo-2">{dolares(plan.cuota)}</dd>
                      <dd className="text-xs text-gris">{bs(plan.cuota)} al mes</dd>
                    </div>
                  </dl>
                </fieldset>
                <button type="button" className="boton boton--ladrillo mt-6 w-full"
                  onClick={() => abrirMensaje(`Hola Umbral, me interesa el apartamento ${unidad.codigo} de la Torre Umbral (${TIPOS[unidad.tipo].m2} m², ${dolares(unidad.precio)}) con ${inicialPct} % de inicial. ¿Cómo lo aparto?`)}>
                  Apartar el {unidad.codigo} por WhatsApp
                </button>
                <p className="mt-3 text-xs text-gris">Cuotas sin intereses, calculadas a {MESES_HASTA_ENTREGA} meses. Precios de muestra.</p>
              </div>
            ) : (
              <div className="mt-6 rounded-[var(--radius-tarjeta)] border border-dashed border-concreto bg-white p-6">
                <p className="titular text-3xl">El piso {piso} ya se vendió completo.</p>
                <p className="mt-2 text-tinta-2">Elige otro piso o pide que te avisemos si alguien libera un apartamento.</p>
                <button type="button" className="boton boton--linea mt-4" onClick={() => abrirMensaje(`Hola Umbral, quiero un apartamento en el piso ${piso} de la Torre Umbral si se libera alguno.`)}>Avísenme</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
