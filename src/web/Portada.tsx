import type { Filtros } from '@/lib/filtros'
import { curvasSVG } from '@/lib/marca'
import { ArrowRight } from 'lucide-react'
import { Buscador } from './Buscador'

const CURVAS = curvasSVG(1400, 900, 24)

type Props = { filtros: Filtros; cambiar: (f: Filtros) => void; buscar: () => void }

export function Portada({ filtros, cambiar, buscar }: Props) {
  return (
    <section className="relative overflow-hidden pt-24 pb-14 md:pt-28 md:pb-20" aria-labelledby="portada-titulo">
      <div className="pointer-events-none absolute inset-0 text-concreto [&_svg]:h-full [&_svg]:w-full" aria-hidden="true" dangerouslySetInnerHTML={{ __html: CURVAS }} />
      <div className="contenedor relative grid items-center gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div className="min-w-0">
          <p className="rotulo">Inmobiliaria · este de Caracas</p>
          <h1 id="portada-titulo" className="mt-4">
            <span className="fuerte block text-[3.1rem] sm:text-7xl lg:text-[5.6rem]">Mírala crecer.</span>
            <span className="titular mt-1 block text-[2.6rem] italic text-ladrillo sm:text-6xl lg:text-[4.6rem]">Vívela antes de la entrega.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-tinta-2">
            Apartamentos en Los Palos Grandes, Altamira, La Castellana y El Hatillo, con plano, fotos y precio en $ y Bs. Y la Torre Umbral, que puedes ver construirse piso por piso.
          </p>
          <div className="mt-8"><Buscador filtros={filtros} cambiar={cambiar} alEnviar={buscar} /></div>
        </div>

        <figure className="relative mx-auto w-full max-w-[540px]">
          <img
            src="/img/umbral/torre-v-560.webp" srcSet="/img/umbral/torre-v-560.webp 560w, /img/umbral/torre-v-900.webp 900w"
            sizes="(min-width: 1024px) 540px, 92vw" width={900} height={1125} decoding="async"
            alt="Torre Umbral terminada al atardecer, en esquina, con ladrillo, jardineras y El Ávila detrás"
            className="aspect-[4/5] w-full rounded-[var(--radius-tarjeta)] object-cover shadow-[0_30px_60px_-30px_rgb(27_29_31/0.55)]"
          />
          <figcaption className="dato absolute top-4 left-4 rounded-[4px] bg-tinta/80 px-2 py-1 text-papel">Torre Umbral · Los Palos Grandes</figcaption>
          <a href="#obra" className="group absolute right-4 bottom-4 rounded-[var(--radius-campo)] bg-papel p-3 text-sm text-tinta shadow-lg">
            <span className="dato block text-ladrillo">Preventa · entrega nov. 2028</span>
            <span className="mt-1 inline-flex items-center gap-1 font-semibold group-hover:underline">Mírala crecer <ArrowRight size={15} aria-hidden="true" /></span>
          </a>
        </figure>
      </div>
    </section>
  )
}
