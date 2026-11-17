# Notas del proyecto Umbral

## Qué se construyó y por qué (17-nov-2026)

- **Referencias:** 9 TikToks de webs de inmobiliarias (resumen en la skill web-playbook, sección 3m). La idea que más
  sirve es la de @fraxbit: tocar el apartamento y ver su plano. Lo que más critican los comentarios: que no se vea
  en el teléfono, las intros largas y el 3D que no deja encontrar nada.
- **Por eso:** el buscador y las propiedades salen primero, sin pantalla de carga. El 3D vive solo en la sección de
  preventa y tiene una función (elegir piso → ver plano → calcular cuotas).
- **Base técnica:** copiada de `carga-gym/` (Vite, React, TypeScript, Tailwind 4, `moneda.ts`, `mensaje.ts`). Diseño
  nuevo: papel y concreto, tinta grafito, ladrillo solo en la acción; Instrument Serif + Manrope.
- **3D liviano:** `Torre3D.tsx` se descarga aparte (130 KB comprimido) cuando la sección está cerca. Solo se activa
  si el equipo tiene 4 núcleos o más, WebGL, no pide ahorro de datos y no pide "menos movimiento". Si falla WebGL,
  vuelve al dibujo SVG (`Edificio.tsx`). Solo se anima mientras se ve en pantalla.
- **Plan de pagos sin crédito:** en Venezuela casi no hay hipotecas; la preventa se paga con inicial y cuotas hasta
  la entrega (`lib/torre.ts`).

## Archivos

- `src/datos.ts`: propiedades, zonas, precios por m² y preguntas (todo de muestra).
- `src/lib/`: filtros, favoritas (localStorage), torre y plan de pagos, validación del formulario, proyección
  isométrica, tasa en Bs y WhatsApp sin número.
- `src/web/`: una sección por archivo. `Edificio.tsx` y `Plano.tsx` dibujan en SVG; `Torre3D.tsx` en Three.js.
- `vercel.json`: cabeceras de seguridad (CSP, anti-iframe, HSTS) y caché larga para las fotos.

## Seguridad

- Sin servidor, sin claves, sin base de datos. Los formularios no envían nada: limpian el texto, lo validan y abren
  WhatsApp sin número.
- CSP solo permite scripts propios, la tasa de ve.dolarapi.com y los mapas de OpenStreetMap.
- `npm audit --omit=dev`: 0 vulnerabilidades (se quitaron paquetes que no se usaban, como el CLI de shadcn).

## Pruebas hechas

- Teléfono (375 px) y PC (1280 px) sin scroll horizontal; ficha, favoritas, filtros, torre y formulario probados.
- axe: sin errores después de corregir el nombre repetido de los dos buscadores.
- 4G lenta + CPU 4 veces más lenta: el titular aparece en 1,66 s; el 3D no se descarga al inicio.
- Con "menos movimiento": sale el dibujo SVG; el botón "Ver en 3D" lo activa sin giro automático.

## Publicación

- Vercel conectado a GitHub el 17-nov-2026: cada push a `main` publica solo en umbral-caracas.vercel.app.

## Falta / ideas

- Fotos reales si un cliente la usa; página propia por propiedad (mejor para Google).
- Si un cliente quiere cargar propiedades él mismo: Supabase con RLS y un panel simple.
