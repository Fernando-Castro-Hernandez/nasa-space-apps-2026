# Lecciones

Errores que ya nos pasaron y no queremos repetir. Cualquier agente lee este archivo antes de empezar un cambio, y agrega una línea cuando alguien del equipo le corrige algo que podría volver a pasar.

Reglas del archivo:

- Una lección por línea: fecha, qué hacer y por qué. Sin párrafos.
- Solo entran correcciones reales, no ideas ni buenas intenciones. Si no pasó, no va.
- Si pasa de 40 líneas, se podan las que ya no apliquen o ya estén cubiertas por un check automático.

## Lecciones

- 2026-11-06 · Si pnpm bloquea un paquete por ser demasiado reciente, fija una versión anterior en vez de agregar una excepción. El bloqueo existe para evitar paquetes comprometidos recién publicados.
- 2026-11-14 · No pases `public/lunito.glb` por `gltf-transform meshopt`: cuantiza y mueve el origen de cada parte, y el código anima alrededor de esos orígenes. `art/lunito/check-glb.mjs` lo detecta.
- 2026-11-14 · En Windows, el instalador del catálogo de shadcn falla con rutas `C:\` ("unknown scheme"). Sirve la carpeta del catálogo en localhost y usa `shadcn add http://127.0.0.1:PUERTO/.../registry.json`.
- 2026-11-15 · Para mostrar algo con el atributo `hidden` no lo sobrescribas con CSS: el preflight de Tailwind lo oculta con `!important` dentro de una capa, y eso le gana a cualquier regla sin capa. Quita el atributo desde React (ver `useWide`).
- 2026-11-15 · Antes de fijar un modelo de Workers AI, revisa el [registro de cambios](https://developers.cloudflare.com/changelog/product/workers-ai/): `llama-3.1-8b-instruct`, el que habíamos decidido, llevaba meses retirado, y `melotts` se retira el 20-nov-2026.
- 2026-11-15 · No confíes en el formato que promete la documentación de un modelo: `melotts` dice MP3 y entrega WAV. El Worker mira los primeros bytes del audio para etiquetarlo.
- 2026-11-15 · No compares textos traducidos para decidir algo (un rol, un estado, una muestra): en otro idioma la comparación falla en silencio. Compara códigos y traduce solo al mostrar.
