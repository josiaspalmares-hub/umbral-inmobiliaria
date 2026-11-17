import type { Filtros } from '@/lib/filtros'
import { ArrowRight } from 'lucide-react'
import { Buscador } from './Buscador'
import { Edificio } from './Edificio'

type Props = { filtros: Filtros; cambiar: (f: Filtros) => void; buscar: () => void }

export function Portada({ filtros, cambiar, buscar }: Props) {
  return (
    <section className="relative overflow-hidden pt-24 pb-14 md:pt-32 md:pb-20" aria-labelledby="portada-titulo">
      <div className="contenedor grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-6">
        <div className="min-w-0">
          <p className="rotulo">Inmobiliaria en el este de Caracas</p>
          <h1 id="portada-titulo" className="titular mt-4 text-[2.9rem] sm:text-6xl lg:text-[5.2rem]">
            Mira el plano del apartamento <em className="text-ladrillo">antes</em> de ir a verlo.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-tinta-2">
            Compra o alquila en Los Palos Grandes, Altamira, La Castellana y El Hatillo. Precios en dólares y bolívares, y documentos revisados antes de publicar.
          </p>
          <div className="mt-8">
            <Buscador filtros={filtros} cambiar={cambiar} alEnviar={buscar} />
          </div>
        </div>

        <div className="relative mx-auto w-fit">
          <Edificio pisos={10} resaltado={6} dibujar className="mx-auto h-[min(46vh,380px)] w-auto lg:h-[min(70vh,600px)]" />
          <a href="#preventa" className="group mx-auto mt-4 block w-fit rounded-[var(--radius-campo)] border border-ladrillo/40 bg-papel/95 p-3 text-sm shadow-sm lg:absolute lg:top-[50%] lg:left-[72%] lg:mt-0 lg:w-[13rem]">
            <span className="cifra block font-bold text-ladrillo">Piso 6 · Apto 6A</span>
            <span className="block text-tinta-2">3 habitaciones · 104 m² · en preventa</span>
            <span className="mt-1 inline-flex items-center gap-1 font-semibold group-hover:underline">Ver la torre <ArrowRight size={15} aria-hidden="true" /></span>
          </a>
        </div>
      </div>
    </section>
  )
}
