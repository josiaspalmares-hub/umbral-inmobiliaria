import { FILTROS_INICIALES, type Filtros } from '@/lib/filtros'
import { abrirMensaje } from '@/lib/mensaje'
import { useTasa } from '@/lib/moneda'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ComoTrabajamos, Contacto, Pie } from './Abajo'
import { Portada } from './Portada'
import { Preventa } from './Preventa'
import { Propiedades } from './Propiedades'
import { Vender } from './Vender'
import { Zonas } from './Zonas'

const ENLACES = [
  { href: '#propiedades', texto: 'Propiedades' },
  { href: '#preventa', texto: 'Torre Umbral' },
  { href: '#zonas', texto: 'Zonas' },
  { href: '#vender', texto: 'Vender' },
]

export function App() {
  const tasa = useTasa()
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES)
  const [solido, setSolido] = useState(false)
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    const revisar = () => setSolido(scrollY > 24)
    revisar()
    addEventListener('scroll', revisar, { passive: true })
    return () => removeEventListener('scroll', revisar)
  }, [])

  const buscar = () => document.getElementById('propiedades')?.scrollIntoView()

  return (
    <>
      <a href="#contenido" className="solo-lector focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-tinta focus:p-3 focus:text-papel">Saltar al contenido</a>
      <header className={cn('fixed inset-x-0 top-0 z-30 transition-[background-color,box-shadow] duration-300', solido || menu ? 'bg-papel/95 shadow-[0_1px_0_var(--color-concreto)] backdrop-blur-sm' : 'bg-transparent')}>
        <div className="contenedor flex h-16 items-center justify-between gap-4">
          <a href="#" className="titular text-[2rem]" aria-label="Umbral, inicio">Umbral</a>
          <nav aria-label="Secciones" className="hidden gap-7 md:flex">
            {ENLACES.map((e) => <a key={e.href} href={e.href} className="font-semibold text-tinta-2 hover:text-tinta hover:underline underline-offset-4">{e.texto}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <button type="button" className="boton boton--tinta min-h-[44px] px-4 text-[0.95rem]" onClick={() => abrirMensaje('Hola Umbral, quiero hablar con un asesor.')}>
              Escríbenos
            </button>
            <button type="button" className="grid size-11 place-items-center rounded-full md:hidden" aria-expanded={menu} aria-controls="menu-movil" aria-label={menu ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenu((v) => !v)}>
              {menu ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>
        {menu && (
          <nav id="menu-movil" aria-label="Secciones" className="contenedor grid pb-4 md:hidden">
            {ENLACES.map((e) => <a key={e.href} href={e.href} onClick={() => setMenu(false)} className="border-t border-concreto py-3 text-lg font-semibold">{e.texto}</a>)}
          </nav>
        )}
      </header>
      <main id="contenido">
        <Portada filtros={filtros} cambiar={setFiltros} buscar={buscar} />
        <Propiedades filtros={filtros} cambiar={setFiltros} tasa={tasa} />
        <Preventa tasa={tasa} />
        <Zonas />
        <Vender />
        <ComoTrabajamos />
        <Contacto />
      </main>
      <Pie />
    </>
  )
}
