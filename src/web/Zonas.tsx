import { PRECIO_M2, ZONAS } from '@/datos'
import { curvasSVG } from '@/lib/marca'
import { dolares } from '@/lib/moneda'
import { useState } from 'react'

const TAMANOS = [55, 80, 110]
const CURVAS = curvasSVG(800, 600, 16)
// Posición aproximada de cada zona en el mapa (el Ávila arriba)
const PINES: Record<string, [number, number]> = {
  'Lomas del Ávila': [82, 16], 'Los Palos Grandes': [58, 33], Altamira: [40, 54], 'La Castellana': [20, 32], 'El Hatillo': [66, 82],
}

export function Zonas() {
  const [m2, setM2] = useState(80)
  const maximo = Math.max(...ZONAS.map((z) => PRECIO_M2[z].m2))

  return (
    <section id="zonas" className="scroll-mt-16 py-16 md:py-24" aria-labelledby="zonas-titulo">
      <div className="contenedor grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <h2 id="zonas-titulo" className="leading-none"><span className="fuerte block text-4xl md:text-5xl">Cada zona,</span><span className="titular block text-4xl italic text-ladrillo md:text-6xl">a su precio.</span></h2>
          <p className="mt-4 text-lg text-tinta-2">Precio promedio del metro cuadrado en venta, para que sepas si una oferta está en lo normal antes de visitar.</p>
          <fieldset className="mt-8 min-w-0">
            <legend className="rotulo mb-3">Calcular para un apartamento de</legend>
            <div className="flex flex-wrap gap-2">
              {TAMANOS.map((t) => (
                <label key={t} className={`relative flex min-h-[44px] cursor-pointer items-center rounded-[var(--radius-campo)] border px-4 font-semibold transition-colors ${m2 === t ? 'border-tinta bg-tinta text-papel' : 'border-concreto hover:border-tinta'}`}>
                  <input type="radio" name="tamano" value={t} checked={m2 === t} onChange={() => setM2(t)} className="solo-lector" />
                  {t} m²
                </label>
              ))}
            </div>
          </fieldset>
          <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-[var(--radius-tarjeta)] bg-white text-concreto [&_svg]:absolute [&_svg]:inset-0 [&_svg]:h-full [&_svg]:w-full" aria-hidden="true">
            <div dangerouslySetInnerHTML={{ __html: CURVAS }} />
            <span className="dato absolute top-3 left-3 text-ok">El Ávila ↑</span>
            {ZONAS.map((z) => (
              <span key={z} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${PINES[z][0]}%`, top: `${PINES[z][1]}%` }}>
                <span className="dato block rounded-full bg-tinta px-2 py-1 whitespace-nowrap text-papel">{dolares(PRECIO_M2[z].m2 * m2)}</span>
                <span className="mt-1 block text-[0.7rem] font-semibold whitespace-nowrap text-tinta">{z}</span>
              </span>
            ))}
          </div>
        </div>
        <table className="w-full text-left">
          <caption className="solo-lector">Precio promedio por metro cuadrado y precio estimado de un apartamento de {m2} m² por zona</caption>
          <thead>
            <tr className="rotulo border-b border-tinta">
              <th scope="col" className="py-3 pr-4 font-bold">Zona</th>
              <th scope="col" className="py-3 pr-4 text-right font-bold">$ por m²</th>
              <th scope="col" className="py-3 text-right font-bold">{m2} m²</th>
            </tr>
          </thead>
          <tbody>
            {ZONAS.map((z) => (
              <tr key={z} className="border-b border-concreto align-top">
                <th scope="row" className="py-4 pr-4 font-normal">
                  <span className="block font-semibold">{z}</span>
                  <span className="block text-sm text-gris">{PRECIO_M2[z].nota}</span>
                  <span className="mt-2 block h-1.5 rounded-full bg-papel-2" aria-hidden="true">
                    <span className="block h-full rounded-full bg-tinta" style={{ width: `${(PRECIO_M2[z].m2 / maximo) * 100}%` }} />
                  </span>
                </th>
                <td className="cifra py-4 pr-4 text-right">{dolares(PRECIO_M2[z].m2)}</td>
                <td className="cifra py-4 text-right font-bold">{dolares(PRECIO_M2[z].m2 * m2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-sm text-gris lg:col-start-2">Cifras de muestra para este proyecto de portafolio, no son un estudio de mercado.</p>
      </div>
    </section>
  )
}
