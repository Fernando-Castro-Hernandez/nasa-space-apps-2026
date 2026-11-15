# Rediseño "Órbita"

> **Estado:** aprobado. La maqueta integral versionada está en [`docs/diseno/prototipos/orbita.html`](../../diseno/prototipos/orbita.html) y es la referencia visual para la implementación por responsables.

Fecha: 2026-11-14 · Autor: Mateo, con acuerdo del equipo para reabrir el diseño.

## Por qué

La app actual se ve como un dashboard genérico de shadcn: tarjetas blancas, lila y cian. Lunito es el centro y la cara del sistema, pero hoy aparece como un adorno del dashboard. Queremos una identidad propia y reconocible donde **todo gire alrededor de Lunito**, literalmente: Lunito es la estrella y sus datos orbitan a su alrededor.

## Metas

- Una identidad visual única en todas las pantallas, construida alrededor de Lunito.
- El estado se lee primero en palabras y en Lunito. Los números quedan a un toque.
- Que se vea bien **con el escenario de Lunito vacío**, porque el modelo 3D sigue en trabajo.
- Usar los componentes Pro de la librería de Fernando (`ShacdnSpaceProComponents`) donde aporten.
- Animaciones sencillas y con propósito (skill de Emil): ease-out fuerte, menos de 300 ms en la interfaz, nada que aparezca desde `scale(0)`.

## No metas

- Tema oscuro. El ícono de sol se quita hasta que exista.
- Funcionalidad nueva. Se rediseña lo que ya existe en `SISTEMA.md` §9 y `HISTORIAS.md`.
- Crear o reemplazar el modelo 3D. Inicio reutiliza `public/lunito.glb` mediante `LunitoScene`; el escenario vacío queda únicamente como fallback si el modelo no carga.

## Anti-metas: sería un fracaso aunque funcione si…

- Parece un instrumento médico o un diagnóstico.
- Vuelve a parecer un dashboard de tarjetas.
- El color de estado aparece sin palabra, o se usa como decoración.
- La emergencia se ve lúdica.

## Restricciones

- Siguen vigentes de `DISENO.md`:
  - los tres estados (Bien en cian, Precaución en ámbar, Atención en rojo), siempre con palabra e ícono;
  - Emergencia siempre visible arriba a la derecha;
  - barra inferior Inicio · Equipo · Tareas · Ajustes;
  - el check-in es lo primero del día;
  - las gráficas no llevan línea base;
  - de qué parte del cuerpo sale cada dato: el pulso del brazo izquierdo, la HRV de la mano derecha y el oxígeno de la pancita;
  - texto de al menos 15 px y botones de al menos 44 px (48 px en lo principal).
- Las referencias PNG dejan de mandar. Las reemplaza este documento.
- La propiedad de archivos de `REPARTO.md` no cambia. Ver "Implementación por dueño".
- `prefers-reduced-motion` detiene las órbitas, las burbujas y el conteo de cifras.

## Enfoques considerados

Primera ronda, con la investigación de apps de salud: Bitácora de misión (papel, NASA 1975), Ojo de buey (oscuro y cálido) y Consola clara (instrumental). El equipo pidió repetir la investigación con Lunito como centro.

Segunda ronda, con apps donde el personaje es la interfaz (Finch, Snoopy de watchOS, Gentler Streak, Duolingo):

| Enfoque                                                  | Qué ofrece                                                     | Qué cuesta                                    |
| -------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------- |
| **Pecera**: Lunito en un tanque detrás de un ojo de buey | El agua del ajolote y el hábitat espacial en una sola metáfora | Fondo oscuro, y menos "espacial"              |
| **Cabina nocturna**: Lunito a pantalla completa          | La más impactante                                              | Esconde números y check-in; vacía se ve pobre |
| **Órbita**: los datos orbitan a Lunito como lunas        | La más espacial. La Constelación sale natural de ella          | Riesgo de verse fría o como dashboard         |

**Elegido: Órbita, en claro sobre marfil** (decisión de Mateo). Para evitar la frialdad, Lunito habla en primera persona y hay un solo color de acción cálido. Para que no parezca dashboard, Inicio no lleva tarjetas.

## Sistema visual

### Color

Tokens nuevos en `src/index.css`, que mapean las variables de shadcn para que los componentes Pro hereden el estilo. Los valores son el punto de partida. Antes de fijarlos se validan con `dataviz/scripts/validate_palette.js` y contraste AA sobre marfil.

| Rol           | Valor                              | Uso                                                                                      |
| ------------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| Fondo marfil  | `#F6F1E7`                          | `--background`                                                                           |
| Superficie    | `#FFFCF6`                          | Hojas, paneles y lunas                                                                   |
| Tinta noche   | `#1B2236`                          | Texto principal; también es el botón principal                                           |
| Tinta suave   | `#5E6478`                          | Texto secundario                                                                         |
| Órbita        | `#1B2236` al 14 %                  | Anillos de 1 px y separadores                                                            |
| Acción cálida | `#E8794A` (terracota)              | Un solo uso por pantalla: la acción principal del momento (por ejemplo "Hacer check-in") |
| Bien          | relleno `#2BB8CC`, texto `#0B7F92` | Solo estado                                                                              |
| Precaución    | relleno `#F2B233`, texto `#9A6400` | Solo estado                                                                              |
| Atención      | relleno `#E04A3A`, texto `#B3261E` | Solo estado y Emergencia                                                                 |

Ya no se usan el lila ni el verde.

### Tipografía

- **Space Grotesk**, de 500 a 700: títulos y cifras, con `tabular-nums`.
- **Atkinson Hyperlegible**, 400 y 700: textos e interfaz. Está diseñada para leerse con prisa y desde lejos.
- Las fuentes se sirven desde la app (`@fontsource`) para que la PWA funcione sin red. Es una dependencia nueva y se anota en `DECISIONS.md`.
- Escala: 15, 17, 20, 24, 32, 44 y 64 px. La cifra de una luna mide 28 px en tablet.

### Forma

- Círculos para todo lo que pertenece a Lunito: lunas, avatares, escenario y botón de voz.
- Paneles con radio de 20 px y sin sombra dura, solo una sombra larga de baja opacidad (`0 16px 40px #1B223614`).
- Cada pantalla dibuja como máximo 3 anillos.
- Botones en píldora. El principal va en tinta noche; la acción del momento, en terracota.

### Movimiento

- Las órbitas giran despacio (una vuelta cada 90 s) y solo en Inicio y Equipo. Las lunas no giran: se quedan en su ángulo para poder leerlas.
- Entradas con `scale(0.92) → 1` y opacidad, en 240 ms con `cubic-bezier(0.23,1,0.32,1)` y escalonadas 60 ms.
- Al presionar, todo lo tocable baja a `scale(0.97)`.
- Las cifras cuentan hacia su valor una sola vez, al entrar.
- La emergencia no tiene animaciones decorativas.

## El escenario de Lunito

- Un disco al centro con un degradado radial de marfil a superficie, dos anillos de órbita alrededor y un halo suave del color del estado (8 % de opacidad).
- En el centro se monta `LunitoScene` con `public/lunito.glb`. Si WebGL o el modelo fallan, aparece un contorno punteado con el texto "Lunito está llegando" en tinta suave, 15 px.
- `TodayHero` reserva el hueco del escenario; Fernando mantiene `LunitoScene` y su animación sin cambiar el diseño de Inicio.
- Tamaño:
  - tablet: 420 px de diámetro, con órbitas de hasta 600 px;
  - celular: 260 px de diámetro, con órbitas de hasta 360 px.

## Pantallas

### Inicio (Mateo)

Al empezar el día abre el check-in. Después muestra la Órbita.

- **Órbita:**
  - escenario al centro y tres lunas en su ángulo fijo: Pulso a la izquierda (brazo izquierdo), HRV a la derecha (mano derecha) y SpO₂ abajo (pancita);
  - cada luna mide de 104 a 120 px: ícono, nombre, cifra y unidad, y un anillo exterior del color del estado con la palabra debajo.
- **Debajo de la órbita**, en este orden:
  1. La frase de Lunito en primera persona: "Te veo tranquila hoy".
  2. El estado con ícono y palabra, y el motivo en una línea.
  3. "Qué significa".
  4. Botón "Hacer check-in", o "Check-in hecho ✓".
- **Distribución:** en tablet, la órbita ocupa el 60 % izquierdo y "Tu evolución" la columna derecha, separadas por una línea de órbita. En celular, la órbita arriba y "Tu evolución" debajo.
- **Tocar una luna** abre una hoja con la gráfica grande de ese indicador, su rango con fuente o "pendiente de validar", y una explicación simple. Mientras está abierta, la luna se resalta.

### Tu evolución (Mateo)

- Selector Semana / Mes con píldora deslizante (candidato: `tabs-10` de la librería).
- Una gráfica por indicador:
  - línea de 2 px en tinta noche y área al 6 %;
  - el último punto en el color del estado;
  - el puntero o el teclado muestran un globo con el valor primero y el día después.
- Sin tarjetas: separadores de 1 px. Se aprovecha lo que ya hay en `EvolutionChart.tsx` y `chartMath.ts`.

### Check-in (Jenni)

- Pantalla completa sin barra inferior, salvo Emergencia.
- Escenario de Lunito al centro y título grande.
- El micrófono es una luna de 96 px en terracota. Al escuchar, de ella salen anillos que se expanden en vez de una onda.
- "Escribir respuesta" va como enlace debajo.
- Los bloques de sensor, prueba de reacción y resultado usan los mismos paneles y estados.

### Equipo · Constelación (Mateo)

- La tripulación como una constelación literal: un disco por tripulante (avatar 2D de Lunito, nombre y estado en palabra, sin números) unidos por líneas de 1 px.
- Autonomía: un arco de órbita que se llena hacia la meta de la fase.
- Compañero del día: un panel con su acción y "Enviar ánimo" en terracota.
- Para el comandante: panel RIDGE y balanceador debajo, como paneles sobrios.

### Tareas (Ariff)

- Acciones del día como lista marcable, con un punto de órbita como viñeta.
- Debajo, Botiquín: buscador de síntomas, asistente e inventario con barras de stock en tinta. Ámbar y rojo solo para alertas de stock, siempre con palabra.

### Ajustes (Mateo, perfiles)

- Selección de perfil: los avatares de la tripulación sobre un arco y el elegido al centro.
- "Compartir mi estado" (privacidad) como lista de interruptores.

### Emergencia a bordo (Fernando)

- Rompe a propósito con lo lúdico: sin órbitas ni Lunito animado.
- Banda roja de lado a lado, texto blanco de 24 px o más y contador del retraso en Space Grotesk 44 px.
- Checklist en paneles de alto contraste.

### Consola de Tierra (Fernando)

- Escritorio con más densidad: los mismos tokens y tipografías, cuadrícula de 12 columnas y cifras en Space Grotesk.
- Usa los componentes de datos de la librería (candidatos: `statistics-*`, `datatable-*`, `chart-*`).

### Demo (Mateo)

- Herramienta interna: mismos tokens, sin trabajo visual extra.

## Estructura global (Ariff)

- Se quita la barra lateral (`dashboard-shell-03`).
- Barra inferior de 4 pestañas con ícono y texto. La activa en tinta noche, con un punto de órbita encima.
- Barra superior delgada: "Día 42 · Tránsito" a la izquierda y Emergencia a la derecha, en píldora roja de al menos 48 px.
- El pie con entorno y commit se queda, más discreto.

## Componentes de la librería

Candidatos por revisar en la implementación: `tabs-10` (Semana/Mes), `tooltip-*` (globo de las gráficas), `dialog-block-*` y `sheet` (hoja de cada luna), `badge-*` (estado con palabra), `statistics-*`, `datatable-*` y `chart-*` (consola de Tierra), `button-*` (píldoras), `skeleton-*` (carga). Cada uno se adapta a los tokens. Si un componente trae su propia paleta, se le quita.

## Implementación por dueño

1. **Tokens, tipografía y estructura global** (`src/index.css`, `src/App.tsx`, `src/app/`, de Ariff). Va primero porque todo depende de esto.
2. **Pantallas de Mateo:** Inicio, Tu evolución, Equipo, Ajustes (perfiles) y Demo, además de la integración de `LunitoScene` en `TodayHero`.
3. **Pantallas de los demás:** Check-in (Jenni), Tareas y Botiquín (Ariff), Emergencia y Tierra (Fernando). Cada dueño las adapta con este documento, o da su permiso explícito en su PR para que Mateo lo haga.

`DISENO.md` se reescribe con este sistema en el primer PR, y `DECISIONS.md` registra el cambio de dirección y la dependencia de fuentes.

## Queda para quien implemente

- Ajustar los hex para pasar AA y el validador, sin salirse del rol de cada color.
- El ángulo exacto de cada luna en celular.
- Qué variante concreta de la librería se usa en cada caso.
