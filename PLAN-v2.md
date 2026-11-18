# Umbral v2: la torre que se construye (propuesta, 17-nov-2026)

Pedido del usuario: la v1 quedó "simple". Inmobiliaria debe verse al nivel de Goldhour y Carbon Black: 3D fino,
dinámico, con algunas animaciones que se puedan mirar y revisar, fotos de los apartamentos, y que dé ganas de
comprar. Misma carpeta, mismo repo y misma URL: se cambia el diseño, no se empieza de cero.

## Idea central: "Mírala crecer"

Torre en **3D de vóxeles** (pixel 3D, cubitos como maqueta fina) que se construye mientras bajas:

1. **Terreno:** el lote vacío con la cuadrícula del plano.
2. **Cimientos:** el concreto gris se vierte y sube en capas.
3. **Estructura:** columnas y losas suben piso por piso.
4. **Ladrillos:** los cubitos color ladrillo se colocan en las paredes, uno tras otro.
5. **Vidrio y balcones:** ventanas con reflejo, barandas y plantas en los balcones.
6. **Terminada:** luz de atardecer, ventanas que se encienden y el Ávila detrás.

Cada etapa tiene un texto corto al lado (qué se hace, cuándo, cuánto falta). Funciona además como
**"avance de obra"**: el comprador de preventa ve en qué etapa está su torre (por ejemplo, "Etapa 3 de 6: 48 %").

Al terminar: tocas un piso → la cámara se acerca → el apartamento se abre en vóxeles con muebles (como @fraxbit),
con su ficha, fotos reales y la calculadora de cuotas.

**Técnica:** Three.js con `InstancedMesh` (miles de cubos en un solo dibujo), luz suave y sombras suaves
precalculadas en el color, cámara isométrica, avance controlado por el scroll (sección fija). Teléfono:
menos cubos y animación más corta; "menos movimiento" o teléfono lento: imagen final de la torre (render
del mismo modelo) y la lista de etapas como texto.

## Estructura nueva (borrador)

1. **Portada:** la torre terminada girando despacio al atardecer, titular y el buscador a la vista (sin esperar).
2. **Propiedades:** fotos grandes que cambian al pasar el mouse o deslizar, ficha con galería a pantalla completa.
3. **Mírala crecer:** las 6 etapas con el scroll (la animación protagonista).
4. **Elige tu apartamento:** piso → apartamento en 3D con muebles → fotos → cuotas → apartar.
5. **Zonas:** mapa con pines de las propiedades y precio por m².
6. **Vende con nosotros**, **Cómo trabajamos**, **Contacto** (se mantienen, con más vida).

## Reglas

- Una sola animación protagonista (la construcción); el resto, detalles pequeños.
- El buscador y las propiedades nunca esperan al 3D. Carga del contenido principal < 2 s en 4G lenta.
- Revisar web-playbook completo antes de construir y no repetir el mismo esquema de las otras webs.

## Primer paso al retomar (pedido del usuario, 17-nov-2026, 7:40 PM)

Antes de construir, entregar **borradores visuales** para aprobar: identidad de marca completa (nombre, logo,
paleta, tipografías, tono, fotos, íconos), maquetas de cada sección en PC y teléfono, la secuencia de las 6 etapas
de la torre en cuadros, y la lista de herramientas a usar. En ese nicho una web bien hecha se vende muy bien.
