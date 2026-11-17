import { abrirMensaje } from '@/lib/mensaje'
import { mensajeDePedido, validar, type Errores, type Pedido } from '@/lib/vender'
import { useState } from 'react'

const VACIO: Pedido = { quiero: 'vender', tipo: 'apartamento', zona: '', m2: '', habitaciones: '2', nombre: '' }

const INCLUYE = [
  ['Precio con datos', 'Te decimos cuánto vale según lo que se vendió cerca, no lo que pide el vecino.'],
  ['Fotos y plano', 'Fotos de día con luz natural y el plano del apartamento, como en esta web.'],
  ['Papeles en orden', 'Revisamos documento, solvencias y ficha catastral antes de publicar.'],
  ['Cobras al vender', '5 % solo cuando se firma en el registro. Si no se vende, no pagas.'],
]

function Campo({ id, etiqueta, error, children }: { id: keyof Pedido; etiqueta: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={`v-${id}`} className="mb-1.5 block text-sm font-semibold text-papel/85">{etiqueta}</label>
      {children}
      {error && <p id={`v-${id}-error`} className="mt-1 text-sm text-[#ffb59e]">{error}</p>}
    </div>
  )
}

export function Vender() {
  const [datos, setDatos] = useState<Pedido>(VACIO)
  const [errores, setErrores] = useState<Errores>({})
  const poner = (k: keyof Pedido) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDatos({ ...datos, [k]: e.target.value })
  const marca = (k: keyof Pedido) => (errores[k] ? { 'aria-invalid': true, 'aria-describedby': `v-${k}-error` } : {})

  const enviar = (e: React.FormEvent) => {
    e.preventDefault()
    const { errores: errs, limpio } = validar(datos)
    setErrores(errs)
    if (Object.keys(errs).length) {
      document.getElementById(`v-${Object.keys(errs)[0]}`)?.focus()
      return
    }
    abrirMensaje(mensajeDePedido(limpio))
  }

  return (
    <section id="vender" className="scroll-mt-16 bg-tinta py-16 text-papel md:py-24" aria-labelledby="vender-titulo">
      <div className="contenedor grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 id="vender-titulo" className="titular text-5xl md:text-6xl">¿Vas a vender o alquilar?</h2>
          <p className="mt-4 max-w-lg text-lg text-papel/80">Cuéntanos del inmueble y vamos a verlo esta semana.</p>
          <dl className="mt-10 grid gap-6 sm:grid-cols-2">
            {INCLUYE.map(([t, d]) => (
              <div key={t} className="border-t border-papel/20 pt-4">
                <dt className="font-semibold">{t}</dt>
                <dd className="mt-1 text-papel/75">{d}</dd>
              </div>
            ))}
          </dl>
        </div>

        <form noValidate onSubmit={enviar} className="grid content-start gap-4 rounded-[var(--radius-tarjeta)] bg-tinta-2 p-5 sm:grid-cols-2 md:p-7" aria-label="Datos del inmueble">
          <Campo id="quiero" etiqueta="Quiero" error={errores.quiero}>
            <select id="v-quiero" className="campo" value={datos.quiero} onChange={poner('quiero')} {...marca('quiero')}>
              <option value="vender">Vender</option>
              <option value="alquilar">Alquilar</option>
            </select>
          </Campo>
          <Campo id="tipo" etiqueta="Tipo" error={errores.tipo}>
            <select id="v-tipo" className="campo" value={datos.tipo} onChange={poner('tipo')} {...marca('tipo')}>
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="local">Local</option>
            </select>
          </Campo>
          <div className="sm:col-span-2">
            <Campo id="zona" etiqueta="Zona o urbanización" error={errores.zona}>
              <input id="v-zona" className="campo" value={datos.zona} onChange={poner('zona')} maxLength={60} autoComplete="address-level3" placeholder="Ej.: Los Palos Grandes" {...marca('zona')} />
            </Campo>
          </div>
          <Campo id="m2" etiqueta="Metros cuadrados" error={errores.m2}>
            <input id="v-m2" className="campo cifra" value={datos.m2} onChange={poner('m2')} inputMode="numeric" maxLength={4} placeholder="85" {...marca('m2')} />
          </Campo>
          <Campo id="habitaciones" etiqueta="Habitaciones" error={errores.habitaciones}>
            <input id="v-habitaciones" className="campo cifra" value={datos.habitaciones} onChange={poner('habitaciones')} inputMode="numeric" maxLength={2} {...marca('habitaciones')} />
          </Campo>
          <div className="sm:col-span-2">
            <Campo id="nombre" etiqueta="Tu nombre" error={errores.nombre}>
              <input id="v-nombre" className="campo" value={datos.nombre} onChange={poner('nombre')} maxLength={60} autoComplete="given-name" {...marca('nombre')} />
            </Campo>
          </div>
          <button type="submit" className="boton boton--ladrillo sm:col-span-2">Enviar por WhatsApp</button>
          <p className="text-sm text-papel/65 sm:col-span-2">Esta web no guarda tus datos: solo arma el mensaje para que lo envíes tú. <a href="/privacidad.html" className="underline">Privacidad</a></p>
        </form>
      </div>
    </section>
  )
}
