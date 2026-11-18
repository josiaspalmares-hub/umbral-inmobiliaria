import { abrirMensaje } from '@/lib/mensaje'
import { bolivares, dolares, type EstadoTasa } from '@/lib/moneda'
import {
  MESES_HASTA_ENTREGA, planDePagos, TIPOS, unidadesDelPiso,
} from '@/lib/torre'
import { cn } from '@/lib/utils'
import { useCallback, useMemo, useState } from 'react'
import { TorreVuelta } from './TorreVuelta'
import { Plano } from './Plano'

const INICIALES = [20, 30, 40]

// Imágenes de referencia de la Torre Umbral (las mismas terminaciones en todos los apartamentos)
const GALERIA = [
  { id: 'plano', texto: 'Plano en 3D, amueblado' },
  { id: 'sala', texto: 'Sala y comedor con vista al Ávila' },
  { id: 'cocina', texto: 'Cocina abierta con isla' },
  { id: 'cuarto', texto: 'Habitación principal' },
  { id: 'esquina', texto: 'La torre en la esquina, con El Ávila' },
]

function Galeria() {
  const [vista, setVista] = useState(0)
  const actual = GALERIA[vista]
  return (
    <div>
      <figure className="relative overflow-hidden rounded-[6px] bg-papel">
        <img key={actual.id} src={`/img/umbral/${actual.id}-1280.webp`} srcSet={`/img/umbral/${actual.id}-640.webp 640w, /img/umbral/${actual.id}-1280.webp 1280w`}
          sizes="(min-width: 1024px) 600px, 92vw" alt={actual.texto} width={1280} height={714} loading="lazy"
          className="aspect-[16/9] w-full object-cover motion-safe:animate-[aparecer_0.5s_var(--ease-salida)]" />
        <figcaption className="dato absolute bottom-2 left-2 rounded-[4px] bg-tinta/80 px-2 py-1 text-papel">{actual.texto}</figcaption>
      </figure>
      <div className="mt-2 grid grid-cols-5 gap-2" role="group" aria-label="Elegir imagen del apartamento">
        {GALERIA.map((g, k) => (
          <button key={g.id} type="button" onClick={() => setVista(k)} aria-pressed={k === vista} aria-label={g.texto}
            className={cn('overflow-hidden rounded-[4px]', k === vista ? 'ring-2 ring-ladrillo ring-offset-2' : 'opacity-70 hover:opacity-100')}>
            <img src={`/img/umbral/${g.id}-640.webp`} alt="" width={640} height={357} loading="lazy" className="aspect-[16/10] w-full object-cover" />
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-gris">Imágenes de referencia de la torre y sus terminaciones. La distribución exacta de tu apartamento está abajo.</p>
    </div>
  )
}

export function Preventa({ tasa }: { tasa: EstadoTasa }) {
  const [piso, setPiso] = useState(6)
  const [codigo, setCodigo] = useState('6A')
  const [inicialPct, setInicialPct] = useState(30)

  const unidades = useMemo(() => unidadesDelPiso(piso), [piso])
  const unidad = unidades.find((u) => u.codigo === codigo) ?? unidades.find((u) => !u.vendido)
  const plan = unidad ? planDePagos(unidad.precio, inicialPct) : null

  const elegirPiso = useCallback((p: number) => {
    setPiso(p)
    const libre = unidadesDelPiso(p).find((u) => !u.vendido)
    setCodigo(libre?.codigo ?? '')
  }, [])
  const bs = (n: number) => (tasa.tasa ? bolivares(n, tasa.tasa) : tasa.fallo ? 'Bs no disponible' : 'Calculando…')

  return (
    <section id="preventa" className="scroll-mt-16 bg-papel-2 py-16 md:py-24" aria-labelledby="preventa-titulo">
      <div className="contenedor">
        <p className="rotulo">Preventa · entrega en noviembre de 2028</p>
        <h2 id="preventa-titulo" className="mt-3 max-w-4xl leading-none"><span className="fuerte block text-4xl md:text-6xl">Elige tu piso.</span><span className="titular block text-4xl italic text-ladrillo md:text-6xl">Mira tu apartamento por dentro.</span></h2>
        <p className="mt-5 max-w-2xl text-lg text-tinta-2">
          32 apartamentos en 8 pisos, en Los Palos Grandes. Sin crédito bancario: pagas una inicial y el resto en {MESES_HASTA_ENTREGA} cuotas mientras se construye.
        </p>

        <div className="mt-10"><TorreVuelta piso={piso} alElegir={elegirPiso} /></div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <fieldset className="min-w-0">
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
          </div>

          <div className="min-w-0">
            {unidad && plan ? (
              <div className="rounded-[var(--radius-tarjeta)] bg-white p-4 md:p-6" aria-live="polite">
                <div className="grid gap-5">
                  <Galeria />
                  <Plano tipo={unidad.tipo} className="mx-auto w-full max-w-[420px]" />
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
              <div className="rounded-[var(--radius-tarjeta)] border border-dashed border-concreto bg-white p-6">
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
