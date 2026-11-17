import { useCallback, useState } from 'react'

const CLAVE = 'umbral-guardadas'

// En modo privado o con el almacenamiento bloqueado, las guardadas viven solo mientras la página esté abierta
function leer(): string[] {
  try {
    const crudo = localStorage.getItem(CLAVE)
    const lista: unknown = crudo ? JSON.parse(crudo) : []
    return Array.isArray(lista) ? lista.filter((x): x is string => typeof x === 'string') : []
  } catch (error) {
    if (error instanceof DOMException || error instanceof SyntaxError) {
      console.warn('No se pudieron leer las guardadas:', error.message)
      return []
    }
    throw error
  }
}

function escribir(lista: string[]) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista))
  } catch (error) {
    if (!(error instanceof DOMException)) throw error
    console.warn('No se pudieron guardar las favoritas:', error.message)
  }
}

export function useGuardadas() {
  const [ids, setIds] = useState<string[]>(leer)
  const alternar = useCallback((id: string) => {
    setIds((actual) => {
      const nueva = actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]
      escribir(nueva)
      return nueva
    })
  }, [])
  return { ids, alternar }
}
