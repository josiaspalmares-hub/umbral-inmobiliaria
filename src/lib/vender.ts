// Validación del formulario "Vende o alquila tu inmueble". No hay servidor: el texto solo arma un mensaje de WhatsApp.
export type Pedido = { quiero: string; tipo: string; zona: string; m2: string; habitaciones: string; nombre: string }
export type Errores = Partial<Record<keyof Pedido, string>>

// eslint-disable-next-line no-control-regex -- se quitan a propósito los caracteres de control
const limpiar = (s: string) => s.replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim()

export function validar(datos: Pedido): { errores: Errores; limpio: Pedido } {
  const limpio = Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, limpiar(v)])) as Pedido
  const errores: Errores = {}
  if (!['vender', 'alquilar'].includes(limpio.quiero)) errores.quiero = 'Elige vender o alquilar.'
  if (!['apartamento', 'casa', 'local'].includes(limpio.tipo)) errores.tipo = 'Elige el tipo de inmueble.'
  if (limpio.zona.length < 3 || limpio.zona.length > 60) errores.zona = 'Escribe la zona o urbanización (3 a 60 letras).'
  const m2 = Number(limpio.m2)
  if (!Number.isInteger(m2) || m2 < 20 || m2 > 2000) errores.m2 = 'Escribe los metros en números, entre 20 y 2000.'
  const hab = Number(limpio.habitaciones)
  if (!Number.isInteger(hab) || hab < 0 || hab > 10) errores.habitaciones = 'Entre 0 y 10.'
  if (limpio.nombre.length < 2 || limpio.nombre.length > 60) errores.nombre = 'Escribe tu nombre (2 a 60 letras).'
  return { errores, limpio }
}

export const mensajeDePedido = (p: Pedido) =>
  `Hola Umbral, soy ${p.nombre}. Quiero ${p.quiero} un ${p.tipo} de ${p.m2} m² y ${p.habitaciones} habitaciones en ${p.zona}. ¿Cuándo pueden venir a verlo?`
