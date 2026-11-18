import { PROPIEDADES, type Propiedad } from '@/datos'
import { FILTROS_INICIALES, filtrar, type Filtros } from '@/lib/filtros'
import { useGuardadas } from '@/lib/guardadas'
import { abrirMensaje } from '@/lib/mensaje'
import { bolivares, dolares, type EstadoTasa } from '@/lib/moneda'
import { cn } from '@/lib/utils'
import { Bath, BedDouble, Car, Heart, Ruler, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Buscador } from './Buscador'

type Props = { filtros: Filtros; cambiar: (f: Filtros) => void; tasa: EstadoTasa }

const foto = (nombre: string, ancho: 640 | 1200) => `/img/${nombre}-${ancho}.webp`

export function Precio({ p, tasa, grande }: { p: Pick<Propiedad, 'precio' | 'operacion'>; tasa: EstadoTasa; grande?: boolean }) {
  const mes = p.operacion === 'alquiler' ? ' /mes' : ''
  return (
    <div>
      <p className={cn('cifra font-bold', grande ? 'text-3xl' : 'text-2xl')}>{dolares(p.precio)}<span className="text-base font-semibold text-gris">{mes}</span></p>
      <p className="cifra text-sm text-gris">
        {tasa.tasa ? `${bolivares(p.precio, tasa.tasa)}${mes}` : tasa.fallo ? 'Monto en Bs no disponible ahora' : 'Calculando en Bs…'}
      </p>
    </div>
  )
}

function Datos({ p }: { p: Propiedad }) {
  const items = [
    { icono: BedDouble, texto: `${p.habitaciones} hab.` },
    { icono: Bath, texto: `${p.banos} baños` },
    { icono: Ruler, texto: `${p.m2} m²` },
    { icono: Car, texto: `${p.puestos} ${p.puestos === 1 ? 'puesto' : 'puestos'}` },
  ]
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-tinta-2">
      {items.map(({ icono: Icono, texto }) => (
        <li key={texto} className="cifra inline-flex items-center gap-1.5"><Icono size={16} aria-hidden="true" className="text-gris" />{texto}</li>
      ))}
    </ul>
  )
}

export function Propiedades({ filtros, cambiar, tasa }: Props) {
  const { ids: guardadas, alternar } = useGuardadas()
  const [soloGuardadas, setSoloGuardadas] = useState(false)
  const [abierta, setAbierta] = useState<Propiedad | null>(null)

  const lista = soloGuardadas ? PROPIEDADES.filter((p) => guardadas.includes(p.id)) : filtrar(PROPIEDADES, filtros)

  return (
    <section id="propiedades" className="scroll-mt-20 border-t border-concreto py-16 md:py-24" aria-labelledby="propiedades-titulo">
      <div className="contenedor">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="propiedades-titulo" className="leading-none"><span className="fuerte block text-4xl md:text-6xl">Disponibles</span><span className="titular block text-4xl italic text-ladrillo md:text-6xl">hoy, con fotos y plano.</span></h2>
          <button
            type="button" aria-pressed={soloGuardadas} onClick={() => setSoloGuardadas((v) => !v)}
            className={cn('boton min-h-[44px] border px-4 text-[0.95rem]', soloGuardadas ? 'border-ladrillo bg-ladrillo text-white' : 'border-concreto hover:border-tinta')}
          >
            <Heart size={17} aria-hidden="true" className={cn(soloGuardadas && 'fill-current')} /> Guardadas ({guardadas.length})
          </button>
        </div>

        {!soloGuardadas && <div className="mt-8"><Buscador filtros={filtros} cambiar={cambiar} compacto /></div>}

        <p className="mt-6 text-tinta-2" aria-live="polite">
          {lista.length === 1 ? '1 propiedad' : `${lista.length} propiedades`}{soloGuardadas ? ' guardadas' : ' con esos filtros'}
        </p>

        {lista.length === 0 ? (
          <div className="mt-6 rounded-[var(--radius-tarjeta)] border border-dashed border-concreto p-8 text-center">
            <p className="titular text-3xl">{soloGuardadas ? 'Todavía no guardas ninguna.' : 'Nada con esos filtros.'}</p>
            <p className="mt-2 text-tinta-2">{soloGuardadas ? 'Toca el corazón de una propiedad para tenerla aquí.' : 'Prueba otra zona o sube el precio máximo. También podemos avisarte cuando llegue una.'}</p>
            {soloGuardadas ? (
              <button type="button" className="boton boton--linea mt-5" onClick={() => setSoloGuardadas(false)}>Ver todas</button>
            ) : (
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" className="boton boton--linea" onClick={() => cambiar({ ...FILTROS_INICIALES, operacion: filtros.operacion })}>Quitar filtros</button>
                <button type="button" className="boton boton--ladrillo" onClick={() => abrirMensaje(`Hola Umbral, busco ${filtros.operacion === 'venta' ? 'comprar' : 'alquilar'} en ${filtros.zona === 'todas' ? 'el este de Caracas' : filtros.zona}${filtros.habitaciones ? ` con ${filtros.habitaciones} habitaciones o más` : ''}. ¿Me avisan si llega algo?`)}>Avísenme</button>
              </div>
            )}
          </div>
        ) : (
          <ul className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map((p, n) => {
              const guardada = guardadas.includes(p.id)
              const destacada = n === 0 && lista.length > 2
              return (
                <li key={p.id} className={cn('group relative min-w-0', destacada && 'sm:col-span-2 lg:row-span-2')}>
                  {/* Galería editorial: la primera va grande; al pasar el mouse se ve otro ambiente */}
                  <div className="relative overflow-hidden rounded-[var(--radius-tarjeta)] bg-papel-2">
                    <img
                      src={foto(p.foto, 640)} srcSet={`${foto(p.foto, 640)} 640w, ${foto(p.foto, 1200)} 1200w`}
                      sizes={destacada ? '(min-width: 1024px) 800px, 100vw' : '(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw'}
                      alt="" width={640} height={480} loading="lazy" decoding="async"
                      className={cn('w-full object-cover transition-transform duration-700 ease-[var(--ease-salida)] group-hover:scale-[1.04]', destacada ? 'aspect-[4/3] lg:aspect-[16/11]' : 'aspect-[4/3]')}
                    />
                    <img
                      src={foto(p.fotos[1], 640)} alt="" width={640} height={480} loading="lazy" decoding="async"
                      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <span className="dato absolute bottom-3 left-3 rounded-[4px] bg-papel/95 px-2 py-1 text-tinta">{p.zona}</span>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <Precio p={p} tasa={tasa} />
                    <button
                      type="button" aria-pressed={guardada} aria-label={guardada ? `Quitar ${p.titulo} de guardadas` : `Guardar ${p.titulo}`}
                      onClick={() => alternar(p.id)}
                      className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full border border-concreto bg-white transition-colors hover:border-ladrillo"
                    >
                      <Heart size={19} aria-hidden="true" className={cn(guardada ? 'fill-ladrillo text-ladrillo' : 'text-tinta')} />
                    </button>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold">
                    <button type="button" onClick={() => setAbierta(p)} className="text-left after:absolute after:inset-0 after:content-[''] hover:underline">
                      {p.titulo}
                    </button>
                  </h3>
                  <p className="mb-2 text-sm text-gris">{p.piso}</p>
                  <Datos p={p} />
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {abierta && <Ficha p={abierta} tasa={tasa} cerrar={() => setAbierta(null)} />}
    </section>
  )
}

function Ficha({ p, tasa, cerrar }: { p: Propiedad; tasa: EstadoTasa; cerrar: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [vista, setVista] = useState(0)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    d.showModal()
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = '' }
  }, [])

  const { lat, lon } = p.mapa
  const caja = `${lon - 0.006},${lat - 0.004},${lon + 0.006},${lat + 0.004}`

  return (
    <dialog
      ref={ref} onClose={cerrar} aria-labelledby="ficha-titulo"
      onClick={(e) => { if (e.target === ref.current) ref.current.close() }}
      className="m-auto max-h-[100dvh] w-full max-w-4xl overflow-y-auto bg-papel p-0 text-tinta backdrop:bg-tinta/60 sm:max-h-[92dvh] sm:rounded-[var(--radius-tarjeta)]"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-concreto bg-papel px-4 py-3 md:px-6">
        <p className="rotulo">{p.zona} · {p.operacion === 'venta' ? 'En venta' : 'En alquiler'}</p>
        <button type="button" onClick={() => ref.current?.close()} className="grid size-11 place-items-center rounded-full hover:bg-papel-2" aria-label="Cerrar ficha">
          <X size={22} aria-hidden="true" />
        </button>
      </div>
      <div className="grid gap-6 p-4 md:grid-cols-[1.3fr_1fr] md:p-6">
        <div className="min-w-0">
          <img src={foto(p.fotos[vista], 1200)} alt={`Foto ${vista + 1} de ${p.fotos.length} de ${p.titulo}`} width={1200} height={900} className="aspect-[4/3] w-full rounded-[var(--radius-campo)] object-cover" />
          <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="Elegir foto">
            {p.fotos.map((f, i) => (
              <button key={f} type="button" onClick={() => setVista(i)} aria-pressed={i === vista} aria-label={`Ver foto ${i + 1}`}
                className={cn('overflow-hidden rounded-[4px] outline-offset-2', i === vista ? 'ring-2 ring-ladrillo' : 'opacity-75 hover:opacity-100')}>
                <img src={foto(f, 640)} alt="" width={640} height={480} className="aspect-[4/3] w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <h2 id="ficha-titulo" className="titular text-4xl">{p.titulo}</h2>
          <p className="mt-1 text-sm text-gris">{p.piso}</p>
          <div className="mt-4"><Precio p={p} tasa={tasa} grande /></div>
          <div className="mt-4"><Datos p={p} /></div>
          <p className="mt-4 text-tinta-2">{p.detalle}</p>
          <button type="button" className="boton boton--ladrillo mt-6 w-full" onClick={() => abrirMensaje(`Hola Umbral, quiero agendar una visita a "${p.titulo}" en ${p.zona} (código ${p.id}).`)}>
            Agendar visita por WhatsApp
          </button>
        </div>
      </div>
      <iframe
        title={`Mapa aproximado de ${p.titulo}`}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(caja)}&layer=mapnik&marker=${lat}%2C${lon}`}
        loading="lazy" className="aspect-[16/7] w-full border-t border-concreto"
      />
    </dialog>
  )
}
