# Arte 3D de Lunito

Guía para preparar en Blender el modelo de Lunito para que pueda **hablar, expresarse y saludar**. La hace Viridiana con su agente; la animación en código la hace Fernando ([REPARTO.md](REPARTO.md)). El concepto y las reglas de Lunito están en [SISTEMA.md](SISTEMA.md) §1 y su dirección visual en [DISENO.md](DISENO.md).

> **Orden de prioridades de Viridiana:** primero la estación de hardware (HU-03), que es el camino crítico de la demo. El arte de Lunito empieza cuando el ESP32 ya manda datos.

## 1. Qué hay hoy

| Pieza               | Dónde                                    | Estado                                                                                                                                                                                                                |
| ------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Modelo en la app    | `public/lunito.glb`                      | Hecho desde el modelo de Meshy: 10 partes con nombre, unos 34k triángulos, 1.2 MB, 3 texturas JPEG. Sin shape keys ni animaciones. Los materiales no declaran `metallic`, así que glTF los toma como metálicos (1.0). |
| Código que lo anima | `src/features/lunito/useLunitoMotion.ts` | Busca cada parte **por nombre** y la mueve con datos reales: la pancita late con el pulso, las branquias brillan con el SpO2, el cuerpo respira con la HRV, los ojos parpadean.                                       |
| Referencia visual   | `docs/diseno/lunito-hoja.jpg`            | Frente, perfil, espalda y tres cuartos.                                                                                                                                                                               |

**No se rehace el modelo.** Se parte de `public/lunito.glb` y se le agregan piezas. El código anima todo; el GLB no lleva animaciones.

## 2. Contrato del modelo

Lo que el código espera encontrar. Los nombres son **exactos** (mayúsculas, guiones bajos): en Blender son los nombres de los objetos y en el GLB, los de los nodos.

| Parte                                            | Qué es                  | Origen (pivote)   | Estado    |
| ------------------------------------------------ | ----------------------- | ----------------- | --------- |
| `body`                                           | Cuerpo                  | Centro            | Ya existe |
| `belly`                                          | Pancita: es el semáforo | Centro            | Ya existe |
| `gill_L_1` … `gill_L_3`, `gill_R_1` … `gill_R_3` | Branquias               | Centro            | Ya existe |
| `eye_L`, `eye_R`                                 | Ojos                    | Centro            | Ya existe |
| `mouth`                                          | Boca: habla y expresa   | Centro de la boca | **Nueva** |
| `arm_L`, `arm_R`                                 | Brazos para saludar     | Hombro            | **Nueva** |
| `tail`                                           | Cola                    | Base de la cola   | **Nueva** |

Reglas:

- No renombrar, fusionar ni mover el origen de las partes que ya existen.
- Conservar escala (2 unidades de alto), orientación y posición actuales.
- La pancita conserva su textura: el código le gira el tono para el semáforo. No pintarle colores encima.
- `metallic = 0` en todos los materiales (es un muñeco de vinil, no metal). Roughness entre 0.5 y 0.7.

## 3. La boca (`mouth`)

Una malla aparte, pegada a la cara (unos 0.002 de separación para que no parpadee contra el cuerpo):

- Interior morado oscuro `#2a0f3d`, roughness 0.8. Opcional: lengua rosa `#ff7fb6` como segundo material de la misma malla.
- Topología con **al menos 4 anillos concéntricos** alrededor de la abertura; sin eso las formas se deforman mal.
- La forma base (`Basis`) es la **sonrisa cerrada** de la hoja de personaje.
- Lo ideal es borrar la sonrisa pintada de la textura del cuerpo (Texture Paint con clonado) para que no se vean dos bocas. Si no da el tiempo, la `Basis` se coloca exactamente encima de la sonrisa pintada.

### Formas para hablar (shape keys de `mouth`)

Un juego reducido, suficiente para el español, que se pronuncia como se escribe. Los nombres siguen la convención Oculus, la misma de las librerías de lip sync, por si después se usa una.

| Shape key   | Sonidos                | Forma (estilo caricatura: exagerar)          |
| ----------- | ---------------------- | -------------------------------------------- |
| `Basis`     | Silencio               | Sonrisa cerrada                              |
| `viseme_PP` | m, b, p                | Labios apretados, un poco hacia adentro      |
| `viseme_FF` | f, v                   | Labio de abajo sube y casi toca el de arriba |
| `viseme_DD` | d, t, n, l, r, k, g, s | Entreabierta, 20–25 %                        |
| `viseme_aa` | a                      | Muy abierta, 60–70 %                         |
| `viseme_E`  | e                      | Abierta 40 %, ancha                          |
| `viseme_I`  | i, y, ch               | Abierta 20 %, muy ancha                      |
| `viseme_O`  | o                      | Redonda, abierta 45 %                        |
| `viseme_U`  | u                      | Redonda y chica, labios hacia adelante       |

### Expresiones de la boca

| Shape key     | Uso                                           |
| ------------- | --------------------------------------------- |
| `mouthSmile`  | Sonrisa grande: contento, saludo              |
| `mouthPucker` | "Mmm": pensando mientras espera una respuesta |

Probar combinaciones: `viseme_aa` + `mouthSmile` no debe romper la malla.

## 4. Los ojos (shape keys de `eye_L` y `eye_R`)

Los mismos nombres en los dos ojos:

| Shape key  | Uso                                            |
| ---------- | ---------------------------------------------- |
| `eyeBlink` | Ojo cerrado (reemplaza el parpadeo por escala) |
| `eyeHappy` | Ojos felices (^ ^)                             |
| `eyeWide`  | Ojos abiertos de sorpresa o atención           |

**No hay expresiones tristes ni enojadas.** Regla 1 de Lunito: refleja, nunca sufre. Cuando la persona está mal, Lunito la cuida (sonrisa suave, ojos atentos), no se pone triste.

## 5. Brazos y cola

- Separar `arm_L`, `arm_R` y `tail` del cuerpo, con el origen en la articulación para que rotarlos se vea natural.
- Rellenar el hueco que quede en `body` para que no se vea vacío al rotar.
- Prioridad más baja que la boca y los ojos.

## 6. Paso a paso en Blender

### 6.0 Conectar Blender con el agente (MCP)

Con [blender-mcp](https://github.com/ahujasid/blender-mcp) el agente ve la escena, ejecuta Python dentro de Blender y toma capturas del viewport. Seguir el README vigente; en resumen:

1. Blender 4.2 LTS o más nuevo.
2. Instalar `uv` (Windows: `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`).
3. Descargar `addon.py` del repo de blender-mcp. En Blender: Edit → Preferences → Add-ons → Install, y activarlo.
4. En el 3D Viewport abrir la barra lateral (tecla N) → pestaña **BlenderMCP** → conectar.
5. Registrar el servidor en Claude Code: `claude mcp add blender -- uvx blender-mcp` y reiniciar la sesión.
6. Comprobar que el agente lee la escena.

Cuidado: el MCP ejecuta código arbitrario dentro de Blender. Guardar el `.blend` antes de cada paso grande.

Todo lo que se haga por MCP se guarda también como script en `art/lunito/blender/NN_nombre.py`, ejecutable con `blender -b -P`, para poder repetirlo.

### 6.1 Orden de trabajo

| #   | Paso                                                                | Listo cuando…                                                   |
| --- | ------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1   | Importar `public/lunito.glb` y guardar el `.blend` (fuera del repo) | Se ve igual que en la app, con las 10 partes por nombre         |
| 2   | Crear `mouth` y sus shape keys (§3)                                 | Las 8 formas y las 2 expresiones se ven bien solas y combinadas |
| 3   | Shape keys de los ojos (§4)                                         | `eyeBlink` cierra el ojo completo                               |
| 4   | Materiales: `metallic = 0`                                          | Ya no se ve metálico                                            |
| 5   | Separar `arm_L`, `arm_R` y `tail` (§5)                              | Rotar cada parte 30° no deja huecos                             |
| 6   | Exportar, optimizar y validar (§7)                                  | El script de revisión pasa y la app carga el modelo             |

## 7. Exportar, optimizar y validar

**Exportar** (`bpy.ops.export_scene.gltf`): `export_format='GLB'`, `export_yup=True`, `export_apply=False` (para no destruir las shape keys), `export_morph=True`, `export_morph_normal=False`, `export_animations=False`.

**Optimizar** paso por paso, sin `optimize` (une mallas y borraría las partes con nombre) y sin `simplify` (rompe las shape keys):

```bash
pnpm dlx @gltf-transform/cli dedup   art/lunito/out/lunito_raw.glb art/lunito/out/a.glb
pnpm dlx @gltf-transform/cli prune   art/lunito/out/a.glb art/lunito/out/b.glb
pnpm dlx @gltf-transform/cli resize  art/lunito/out/b.glb art/lunito/out/c.glb --width 1024 --height 1024
pnpm dlx @gltf-transform/cli meshopt art/lunito/out/c.glb public/lunito.glb
```

Meta: **2 MB o menos**. No usar Draco ni KTX2. La carpeta `art/lunito/out/` es temporal y está en `.gitignore`.

**Validar:**

- `pnpm dlx @gltf-transform/cli validate public/lunito.glb`: 0 errores.
- `pnpm dlx @gltf-transform/cli inspect public/lunito.glb`: revisar partes y número de shape keys.
- `art/lunito/check-glb.mjs` (Node sin dependencias, lee el JSON del GLB): falla si falta alguna parte del §2, alguna shape key de §3 o §4 (en `mesh.extras.targetNames`), si algún material tiene `metallic` distinto de 0, si hay animaciones o si pesa más de 2 MB.
- Vista previa con sliders de cada shape key: arrastrar el GLB a https://gltf-viewer.donmccurdy.com/ (se abre en el navegador, no se sube).
- En la app: `pnpm dev` y abrir Mi Lunito. Debe verse y moverse igual que antes; las partes nuevas todavía no se animan.

## 8. Qué no hacer

- No retopología, no esqueleto (armature), no Actions ni NLA: las partes ya están separadas y el código anima.
- No hacer las 15 formas de boca completas: las 8 del §3 bastan.
- No tocar nada en `src/`: la animación la hace Fernando.
- No subir el `.blend` ni el modelo original de Meshy (pesan mucho): van en Drive. Al repo solo entran `art/lunito/blender/*.py`, `art/lunito/check-glb.mjs` y `public/lunito.glb`.
- No agregar dependencias al `package.json`: usar `pnpm dlx`.

## 9. Entrega

Rama `V/lunito-arte` desde `staging` y PR en borrador hacia `staging` con:

- Qué partes y shape keys nuevas hay.
- Peso final del GLB y salida del validador y de `check-glb.mjs`.
- Una captura de cada forma de boca y de ojos (puede ser un render en cuadrícula hecho con script; la imagen va en el PR, no en el repo).

Fernando aprueba los PRs.

## 10. Cómo lo usa el código

Para que el arte se entienda; lo implementa Fernando.

- **Voz:** Lunito habla con una voz sintética genérica; la voz final se elige después.
- **Boca:** del texto que va a decir se sacan los sonidos (vocales y consonantes, §3) y se reparten a lo largo del audio; el volumen abre más o menos la boca.
- **Expresión:** sale del semáforo y del momento (saludar, pensar mientras espera), con reglas fijas. **La IA nunca decide la expresión.**
- **Emergencia:** sin gestos ni expresiones; Lunito queda como baliza calma ([SISTEMA.md](SISTEMA.md) §1).
