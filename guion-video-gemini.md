# Guion para pedirle a Gemini (Veo) el video de la Torre Umbral

Objetivo: un solo video de la **misma torre** construyéndose desde el terreno hasta terminada, con la cámara quieta,
para convertirlo en la secuencia que avanza con el scroll. Mientras más quieta la cámara, mejor queda.

## Paso 1: la imagen de la torre terminada (para que todas las tomas sean el mismo edificio)

Pega esto en Gemini (generar imagen):

> Fotografía de arquitectura realista, formato vertical 9:16. Torre residencial moderna de 10 pisos en Los Palos
> Grandes, Caracas, Venezuela. Fachada de ladrillo de arcilla rojizo con columnas y losas de concreto claro a la
> vista, ventanales grandes y balcones con baranda negra fina y jardineras con plantas en cada piso. Remate simple
> en la azotea. Hora dorada al atardecer, cielo cálido naranja y lila, la montaña El Ávila verde detrás. Árboles
> tropicales en la acera. Cámara a la altura de la calle, ligeramente desde abajo, a tres cuartos de la esquina,
> encuadre fijo, edificio completo y centrado. Sin personas, sin carteles, sin logos, sin texto.

Guarda la que más te guste. Si sale con texto o logos, pide otra.

## Paso 2: el video de la construcción (imagen a video)

Sube la imagen del paso 1 y pega esto:

> Timelapse de construcción de este mismo edificio, cámara totalmente fija en el mismo encuadre, sin movimiento de
> cámara. Empieza con el terreno vacío y excavado, luego se vierten los cimientos de concreto, después suben las
> columnas y losas piso por piso, se colocan las paredes de ladrillo, se instalan los ventanales y balcones, y
> termina con el edificio completo al atardecer con las luces de las ventanas encendiéndose. Grúa de construcción
> que aparece al inicio y desaparece al final. Transición continua y suave, 8 segundos, estilo fotografía
> realista, sin personas en primer plano, sin texto ni logos.

Si Gemini no acepta que el video termine en la imagen, pide al revés: "empieza en esta imagen y retrocede en el
tiempo hasta el terreno vacío". Yo lo invierto después.

## Opción B: por partes (6 imágenes del mismo edificio)

Si el video completo no sale bien, pide 6 imágenes usando la del paso 1 como referencia, una por mensaje,
con este texto y cambiando solo la etapa:

> Usando esta misma imagen como referencia, mismo encuadre exacto, misma cámara, misma hora del día y mismo
> entorno (árboles, calle, montaña), muestra el edificio en la etapa: [ETAPA]. Fotografía realista, sin personas
> en primer plano, sin texto ni logos.

Etapas, en orden:
1. terreno vacío y excavado, con la cuadrícula de estacas y cuerdas del plano marcada en la tierra
2. cimientos de concreto recién vertidos, con cabillas saliendo para las columnas
3. estructura de concreto: columnas y losas de los 10 pisos, sin paredes, con una grúa torre al lado
4. paredes de ladrillo de arcilla colocadas en todos los pisos, con los huecos de las ventanas abiertos
5. ventanales y balcones con baranda instalados, todavía con andamios en la planta baja
6. edificio terminado al atardecer, con luces cálidas encendidas en algunas ventanas

Yo las paso por el mismo efecto de "subir como un piso" que ya está en el borrador.

## Paso 3 (opcional): toma de portada

> Toma de dron lenta que rodea esta misma torre al atardecer, de izquierda a derecha, las luces de las ventanas se
> encienden poco a poco, 8 segundos, cámara estable, sin texto ni logos.

## Qué me pasas

Los archivos .mp4 tal como los descargues de Gemini (y la imagen del paso 1). Yo los corto en fotos, los
comprimo para que carguen rápido en el teléfono y los conecto al scroll. Si alguna toma sale con logos, texto o
personas reconocibles, no la usamos.

## Ronda 2 (17-nov-2026): imágenes que necesito

Lo que falló en el primer video: la cámara se movía, el edificio quedó de 6 pisos y terminó con la excavación
alrededor. Pedir siempre: **cámara fija, mismo encuadre, torre de 10 pisos, entorno terminado al final**.

1. **Torre terminada (la más importante):** fachada frontal, formato 16:9, edificio centrado con aire a los lados
   (para recortarla también en vertical para el teléfono).
2. **Interiores del mismo apartamento:** sala-comedor con vista al Ávila, cocina abierta, habitación principal.
3. **Plano 3D amueblado** del apartamento visto desde arriba en diagonal (como maqueta cortada sin techo).

## Ronda 3 (18-nov-2026): video para que la torre gire (360°)

Subir la foto de la fachada de frente y pedir:

> Toma de dron que da una vuelta completa de 360 grados alrededor de este mismo edificio, a velocidad constante,
> a la misma altura y a la misma distancia todo el tiempo, siempre con el edificio centrado y completo en el
> cuadro. Misma hora del atardecer, mismas luces encendidas, mismos árboles y calles. Movimiento suave, sin
> zoom, sin cortes, sin cambiar de ángulo vertical. Formato horizontal 16:9, 8 segundos. Sin personas, sin texto,
> sin logos.

Si no da la vuelta completa, pedir media vuelta (de la fachada de frente a la esquina) y la repito en espejo.
Con ese video, la foto de "Elige tu piso" se podrá girar arrastrando con el dedo.
