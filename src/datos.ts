// Datos de muestra: Umbral es una inmobiliaria ficticia. Precios y direcciones son de ejemplo.

export const EMPRESA = {
  nombre: 'Umbral',
  direccion: '3.ª avenida de Los Palos Grandes, edificio Ávila Norte, piso 2, Caracas',
  como_llegar: 'https://www.openstreetmap.org/?mlat=10.4997&mlon=-66.8450#map=17/10.4997/-66.8450',
  horario: 'Lunes a viernes de 8:30 AM a 6:00 PM · sábados de 9:00 AM a 1:00 PM',
}

export type Operacion = 'venta' | 'alquiler'

export type Propiedad = {
  id: string
  titulo: string
  zona: Zona
  operacion: Operacion
  precio: number // dólares; en alquiler es mensual
  habitaciones: number
  banos: number
  m2: number
  puestos: number
  piso: string
  foto: string
  fotos: string[]
  detalle: string
  mapa: { lat: number; lon: number }
}

export const ZONAS = ['Los Palos Grandes', 'Altamira', 'La Castellana', 'El Hatillo', 'Lomas del Ávila'] as const
export type Zona = (typeof ZONAS)[number]

export const PROPIEDADES: Propiedad[] = [
  {
    id: 'lpg-3a', titulo: 'Apartamento con balcón hacia el Ávila', zona: 'Los Palos Grandes', operacion: 'venta',
    precio: 128000, habitaciones: 2, banos: 2, m2: 86, puestos: 1, piso: 'Piso 6', foto: 'sala1',
    fotos: ['sala1', 'cocina2', 'cuarto2'],
    detalle: 'Remodelado en 2024: cocina abierta, piso de porcelanato y ventanales en la sala. A dos cuadras de la plaza Los Palos Grandes. Pozo de agua y planta eléctrica en el edificio.',
    mapa: { lat: 10.4996, lon: -66.8447 },
  },
  {
    id: 'alt-7b', titulo: 'Tres habitaciones cerca del metro Altamira', zona: 'Altamira', operacion: 'venta',
    precio: 165000, habitaciones: 3, banos: 2, m2: 118, puestos: 2, piso: 'Piso 9', foto: 'sala2',
    fotos: ['sala2', 'cocina1', 'cuarto1'],
    detalle: 'Sala comedor amplia con piso de madera, cuarto de servicio y maletero. Cinco minutos a pie del metro. Vigilancia las 24 horas.',
    mapa: { lat: 10.4963, lon: -66.8484 },
  },
  {
    id: 'cas-2c', titulo: 'Amoblado listo para mudarse', zona: 'La Castellana', operacion: 'alquiler',
    precio: 950, habitaciones: 2, banos: 2, m2: 78, puestos: 1, piso: 'Piso 4', foto: 'sala3',
    fotos: ['sala3', 'cocina3', 'cuarto3'],
    detalle: 'Se alquila con muebles, línea blanca y aire acondicionado en las habitaciones. Contrato mínimo de un año y un mes de depósito.',
    mapa: { lat: 10.5005, lon: -66.8556 },
  },
  {
    id: 'hat-casa', titulo: 'Casa con jardín y vista al valle', zona: 'El Hatillo', operacion: 'venta',
    precio: 240000, habitaciones: 4, banos: 3, m2: 210, puestos: 3, piso: 'Casa de 2 plantas', foto: 'sala4',
    fotos: ['sala4', 'cocina2', 'cuarto3'],
    detalle: 'Urbanización cerrada con vigilancia. Jardín de 300 m², terraza techada y tanque de agua de 10.000 litros. A diez minutos del pueblo de El Hatillo.',
    mapa: { lat: 10.4253, lon: -66.8255 },
  },
  {
    id: 'lom-1a', titulo: 'Estudio con terraza en Lomas del Ávila', zona: 'Lomas del Ávila', operacion: 'alquiler',
    precio: 600, habitaciones: 1, banos: 1, m2: 52, puestos: 1, piso: 'Piso 2', foto: 'sala5',
    fotos: ['sala5', 'cocina3', 'cuarto2'],
    detalle: 'Ideal para una persona o pareja. Terraza privada, cocina equipada y conserjería. Se aceptan mascotas pequeñas.',
    mapa: { lat: 10.4985, lon: -66.8228 },
  },
  {
    id: 'alt-pent', titulo: 'Penthouse de dos niveles', zona: 'Altamira', operacion: 'venta',
    precio: 310000, habitaciones: 3, banos: 4, m2: 190, puestos: 3, piso: 'PH, pisos 14 y 15', foto: 'sala6',
    fotos: ['sala6', 'cocina1', 'cuarto1'],
    detalle: 'Doble altura en la sala, terraza de 40 m² y estudio en el nivel superior. Ascensor llega a los dos niveles.',
    mapa: { lat: 10.4979, lon: -66.8506 },
  },
  {
    id: 'lpg-alq', titulo: 'Dos habitaciones a una cuadra de la plaza', zona: 'Los Palos Grandes', operacion: 'alquiler',
    precio: 1100, habitaciones: 2, banos: 2, m2: 92, puestos: 2, piso: 'Piso 11', foto: 'sala7',
    fotos: ['sala7', 'cocina2', 'cuarto3'],
    detalle: 'Edificio nuevo con gimnasio y planta eléctrica. Sala con salida a balcón y vista al Ávila. Se entrega sin muebles.',
    mapa: { lat: 10.5009, lon: -66.8439 },
  },
  {
    id: 'cas-3b', titulo: 'Apartamento familiar con estudio', zona: 'La Castellana', operacion: 'venta',
    precio: 145000, habitaciones: 3, banos: 2, m2: 112, puestos: 2, piso: 'Piso 5', foto: 'sala8',
    fotos: ['sala8', 'cocina3', 'cuarto2'],
    detalle: 'Tres habitaciones más un estudio que puede ser cuarta habitación. Cerca de colegios y del centro comercial.',
    mapa: { lat: 10.4998, lon: -66.8573 },
  },
]

// Precio promedio de referencia por m² (muestra, no es un estudio de mercado)
export const PRECIO_M2: Record<Zona, { m2: number; nota: string }> = {
  'Los Palos Grandes': { m2: 1480, nota: 'Plazas, cafés y el Ávila a pie.' },
  Altamira: { m2: 1400, nota: 'Metro, oficinas y la avenida Francisco de Miranda.' },
  'La Castellana': { m2: 1350, nota: 'Calles tranquilas, colegios y clínicas cerca.' },
  'El Hatillo': { m2: 1150, nota: 'Casas con jardín y clima más fresco.' },
  'Lomas del Ávila': { m2: 1050, nota: 'Más espacio por el mismo dinero.' },
}

export const PREGUNTAS = [
  {
    p: '¿Qué documentos revisan antes de publicar una propiedad?',
    r: 'Documento de propiedad registrado, cédula catastral, solvencia municipal y de condominio, y que no tenga hipoteca ni prohibición de enajenar. Si falta algo, no la publicamos hasta que esté.',
  },
  {
    p: '¿Puedo comprar en preventa sin crédito bancario?',
    r: 'Sí. En la Torre Umbral pagas una inicial y el resto en cuotas mensuales mientras se construye. Al recibir el apartamento ya está pagado.',
  },
  {
    p: '¿Cuánto cobran si quiero vender mi apartamento?',
    r: 'El 5 % del precio de venta, solo cuando se firma en el registro. Incluye fotos, plano, publicación y acompañamiento en la notaría.',
  },
  {
    p: '¿Los precios son negociables?',
    r: 'Depende del dueño. Te decimos con franqueza si el precio está en el promedio de la zona antes de que hagas una oferta.',
  },
]
