import { useEffect, useState } from 'react'

// Tasa oficial del BCV desde ve.dolarapi.com
const URL_TASA = 'https://ve.dolarapi.com/v1/dolares/oficial'

let pedido: Promise<number> | null = null

function pedirTasa(): Promise<number> {
  pedido ??= fetch(URL_TASA)
    .then((r) => {
      if (!r.ok) throw new Error(`La tasa respondió ${r.status}`)
      return r.json()
    })
    .then((d: { promedio?: number }) => {
      if (typeof d.promedio !== 'number' || d.promedio <= 0) throw new Error('La tasa llegó sin promedio')
      return d.promedio
    })
  return pedido
}

export type EstadoTasa = { tasa: number | null; fallo: boolean }

export function useTasa(): EstadoTasa {
  const [estado, setEstado] = useState<EstadoTasa>({ tasa: null, fallo: false })
  useEffect(() => {
    let vivo = true
    pedirTasa().then(
      (tasa) => vivo && setEstado({ tasa, fallo: false }),
      (error: Error) => {
        console.warn('Sin tasa en bolívares:', error.message)
        if (vivo) setEstado({ tasa: null, fallo: true })
      },
    )
    return () => { vivo = false }
  }, [])
  return estado
}

export const dolares = (n: number) => `$${n.toLocaleString('es-VE')}`
export const bolivares = (n: number, tasa: number) =>
  `Bs ${(n * tasa).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
