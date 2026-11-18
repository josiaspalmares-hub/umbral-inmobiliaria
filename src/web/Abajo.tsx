import { EMPRESA, PREGUNTAS } from '@/datos'
import { logoSVG } from '@/lib/marca'
import { Plus } from 'lucide-react'

const LOGO_CLARO = logoSVG({ arriba: '#f2b36b', izq: '#b5532f', der: '#8a3b20' })

const PASOS = [
  ['Eliges desde el teléfono', 'Filtras por zona y precio, ves fotos y el plano, y guardas las que te gustan.'],
  ['Visitas con un asesor', 'Te acompaña la misma persona de principio a fin. Visitas de lunes a sábado.'],
  ['Revisamos los papeles', 'Antes de dar una señal, verificamos que el inmueble se pueda vender sin problemas.'],
  ['Firmas en el registro', 'Te acompañamos en la notaría y el registro hasta tener tu documento.'],
]

const EQUIPO = [
  ['MV', 'Mariela Villasmil', 'Ventas en Los Palos Grandes y Altamira'],
  ['JR', 'Javier Rondón', 'Alquileres y La Castellana'],
  ['AC', 'Andreína Colmenares', 'Abogada: documentos y registro'],
]

export function ComoTrabajamos() {
  return (
    <section id="como" className="scroll-mt-16 border-t border-concreto py-16 md:py-24" aria-labelledby="como-titulo">
      <div className="contenedor">
        <h2 id="como-titulo" className="titular max-w-3xl text-5xl md:text-6xl">De la primera búsqueda a las llaves.</h2>
        <ol className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map(([t, d], i) => (
            <li key={t} className="border-t border-tinta pt-4">
              <span className="titular cifra text-4xl text-ladrillo">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-2 font-semibold">{t}</h3>
              <p className="mt-1 text-tinta-2">{d}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <h3 className="titular text-4xl">Quién te atiende</h3>
            <ul className="mt-6 divide-y divide-concreto border-y border-concreto">
              {EQUIPO.map(([ini, nombre, rol]) => (
                <li key={nombre} className="flex items-center gap-4 py-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-papel-2 font-bold text-tinta-2" aria-hidden="true">{ini}</span>
                  <span><span className="block font-semibold">{nombre}</span><span className="block text-sm text-gris">{rol}</span></span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="titular text-4xl">Preguntas frecuentes</h3>
            <div className="mt-6 border-t border-concreto">
              {PREGUNTAS.map(({ p, r }) => (
                <details key={p} className="group border-b border-concreto">
                  <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
                    {p}
                    <Plus size={20} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="pb-4 text-tinta-2">{r}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Contacto() {
  return (
    <section id="contacto" className="scroll-mt-16 bg-papel-2 py-16 md:py-24" aria-labelledby="contacto-titulo">
      <div className="contenedor grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 id="contacto-titulo" className="titular text-5xl md:text-6xl">Pasa por la oficina</h2>
          <p className="mt-4 text-lg">{EMPRESA.direccion}</p>
          <p className="mt-2 text-tinta-2">{EMPRESA.horario}</p>
          <a className="boton boton--linea mt-8" href={EMPRESA.como_llegar} target="_blank" rel="noopener">Cómo llegar</a>
        </div>
        <iframe
          title="Mapa de la oficina de Umbral en Los Palos Grandes"
          src="https://www.openstreetmap.org/export/embed.html?bbox=-66.8501%2C10.4965%2C-66.8399%2C10.5029&layer=mapnik&marker=10.4997%2C-66.8450"
          loading="lazy"
          className="aspect-[4/3] w-full rounded-[var(--radius-tarjeta)] lg:aspect-auto lg:h-full lg:min-h-[360px]"
        />
      </div>
    </section>
  )
}

export function Pie() {
  return (
    <footer className="bg-tinta text-papel">
      <div className="contenedor grid gap-6 py-16 md:grid-cols-[1fr_auto] md:items-end md:py-24">
        <div>
          <p className="leading-none"><span className="titular block text-4xl italic text-atardecer md:text-6xl">Tu próxima dirección</span><span className="fuerte block text-5xl md:text-8xl">empieza aquí.</span></p>
          <p className="mt-8 flex items-center gap-3"><span className="inline-block w-10" aria-hidden="true" dangerouslySetInnerHTML={{ __html: LOGO_CLARO }} /><span className="text-2xl font-extrabold tracking-[0.18em]">UMBRAL</span></p>
          <p className="mt-3 max-w-xl text-papel/75">
            <strong className="text-papel">Proyecto de muestra.</strong> Umbral es una inmobiliaria ficticia hecha por{' '}
            <a className="underline underline-offset-2" href="https://josias-palmares.vercel.app" target="_blank" rel="noopener">Josías Palmares</a>{' '}
            para su portafolio. Propiedades, precios, personas y la Torre Umbral son de ejemplo.
          </p>
          <p className="mt-2 text-sm text-papel/65">
            Torre, interiores y videos: generados con IA (Gemini) · Fotos de propiedades: <a className="underline" href="https://www.pexels.com" target="_blank" rel="noopener">Pexels</a> · Mapa: <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · Tasa: <a className="underline" href="https://ve.dolarapi.com" target="_blank" rel="noopener">DolarApi</a>
          </p>
        </div>
        <a className="underline-offset-4 hover:underline" href="/privacidad.html">Privacidad</a>
      </div>
    </footer>
  )
}
