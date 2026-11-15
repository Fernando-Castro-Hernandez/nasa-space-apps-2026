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
