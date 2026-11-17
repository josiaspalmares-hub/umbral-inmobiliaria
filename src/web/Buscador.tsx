import { ZONAS, type Operacion, type Zona } from '@/datos'
import { TOPES, type Filtros } from '@/lib/filtros'
import { dolares } from '@/lib/moneda'
import { cn } from '@/lib/utils'
import { useId } from 'react'

type Props = {
  filtros: Filtros
  cambiar: (f: Filtros) => void
  alEnviar?: () => void
  compacto?: boolean
}

const OPERACIONES: { valor: Operacion; texto: string }[] = [
  { valor: 'venta', texto: 'Comprar' },
  { valor: 'alquiler', texto: 'Alquilar' },
]

export function Buscador({ filtros, cambiar, alEnviar, compacto }: Props) {
  const id = useId()
  const poner = <K extends keyof Filtros>(k: K, v: Filtros[K]) => cambiar({ ...filtros, [k]: v })
  const sufijo = filtros.operacion === 'alquiler' ? '/mes' : ''

  return (
    <form
      className={cn('grid grid-cols-2 gap-3', compacto ? 'lg:grid-cols-4' : 'rounded-[var(--radius-tarjeta)] bg-white p-4 shadow-[0_1px_0_rgb(29_33_37/0.06),0_12px_32px_-18px_rgb(29_33_37/0.35)] sm:grid-cols-3 md:p-5')}
      onSubmit={(e) => { e.preventDefault(); alEnviar?.() }}
      aria-label={compacto ? "Filtrar propiedades" : "Buscar propiedades"}
    >
      <fieldset className={cn('col-span-2 min-w-0', compacto ? 'lg:col-span-1' : 'sm:col-span-3 sm:max-w-xs')}>
        <legend className="rotulo mb-1.5">Quiero</legend>
        <div className="grid grid-cols-2 rounded-[var(--radius-campo)] border border-concreto p-1">
          {OPERACIONES.map((o) => (
            <label key={o.valor} className={cn('relative flex min-h-[38px] cursor-pointer items-center justify-center rounded-[4px] px-4 text-[0.95rem] font-semibold transition-colors', filtros.operacion === o.valor ? 'bg-tinta text-papel' : 'text-tinta hover:bg-papel-2')}>
              <input
                type="radio" name={`${id}-op`} value={o.valor} className="solo-lector"
                checked={filtros.operacion === o.valor}
                onChange={() => cambiar({ ...filtros, operacion: o.valor, precioMax: 0 })}
              />
              {o.texto}
            </label>
          ))}
        </div>
      </fieldset>
      <div className={cn('col-span-2 min-w-0', compacto ? 'lg:col-span-1' : 'sm:col-span-1')}>
        <label htmlFor={`${id}-zona`} className="rotulo mb-1.5 block">Zona</label>
        <select id={`${id}-zona`} className="campo" value={filtros.zona} onChange={(e) => poner('zona', e.target.value as Zona | 'todas')}>
          <option value="todas">Todo el este</option>
          {ZONAS.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>
      <div className="min-w-0">
        <label htmlFor={`${id}-hab`} className="rotulo mb-1.5 block">Habitaciones</label>
        <select id={`${id}-hab`} className="campo" value={filtros.habitaciones} onChange={(e) => poner('habitaciones', Number(e.target.value))}>
          <option value={0}>Cualquiera</option>
          <option value={1}>1 o más</option>
          <option value={2}>2 o más</option>
          <option value={3}>3 o más</option>
        </select>
      </div>
      <div className="min-w-0">
        <label htmlFor={`${id}-precio`} className="rotulo mb-1.5 block">Precio máximo</label>
        <select id={`${id}-precio`} className="campo" value={filtros.precioMax} onChange={(e) => poner('precioMax', Number(e.target.value))}>
          <option value={0}>Sin límite</option>
          {TOPES[filtros.operacion].map((t) => <option key={t} value={t}>Hasta {dolares(t)}{sufijo}</option>)}
        </select>
      </div>
      {!compacto && <button type="submit" className="boton boton--ladrillo col-span-2 sm:col-span-3">Ver propiedades</button>}
    </form>
  )
}
