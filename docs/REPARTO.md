# Reparto de módulos y pantallas

Fuente de verdad sobre quién construye cada parte del producto. Las historias y criterios de aceptación siguen en [HISTORIAS.md](HISTORIAS.md); este archivo solo define propiedad, límites e integración.

## Reglas de trabajo

- Cada módulo tiene una persona responsable de implementarlo, probarlo y mantenerlo.
- Solo la persona responsable modifica los archivos de su módulo. Los demás consumen sus componentes o contratos.
- Cada historia o grupo pequeño inseparable va en su propia rama y PR hacia `staging`; no se crean ramas largas por persona.
- Se construye primero P1. P2 y P3 empiezan cuando el flujo principal de la demo funciona.
- Nadie espera una integración real: cada consumidor usa datos simulados o un adaptador local que respete el contrato acordado.
- Ariff integra la estructura, la navegación y los estilos globales. Las demás personas entregan componentes exportables con estilos dentro de su módulo.
- Una dependencia nueva requiere acuerdo y registro en [DECISIONS.md](DECISIONS.md).
- **2026-11-14 · Primera versión de las pantallas.** Con acuerdo del equipo, Ariff construyó una primera versión de todas las pantallas, cada una en la carpeta de su responsable. Desde ahí, cada responsable la toma y la mantiene según la tabla de abajo.

## Responsables

### Mateo · visión de la tripulación

**Historias:** HU-01, HU-02, HU-15, HU-16, HU-17, HU-26, HU-27, HU-28 y HU-30.

**Módulos**

- Perfiles de la tripulación.
- Feed e historial simulados.
- Mi Lunito, Constelación, panel RIDGE y autonomía.
- Estado personal y tendencias.
- Compañero del día y balanceador de carga.
- Controles ocultos de la demo.

**Pantallas y superficies**

- Selección de perfil.
- Mi Lunito.
- Tripulación (Constelación).
- Mi estado.
- Panel oculto `/demo`.
- Tarjeta del compañero y aviso para el comandante.

**Zona de archivos:** `src/features/profiles/`, `src/features/lunito/` (menos los archivos 3D de Lunito, que son de Fernando), `src/features/crew/`, `src/features/status/`, `src/features/demo/` y `src/data/`.

### Jenni · medición y experiencia del check-in

**Historias:** HU-04, HU-05, HU-07, HU-10 y HU-18.

**Módulos**

- Conexión Web Bluetooth y estado del sensor.
- Adaptador común para sensor real y sesiones grabadas.
- Control de calidad de las lecturas.
- Prueba de reacción.
- Respiración guiada.
- Composición de la pantalla de check-in.

**Pantallas y superficies**

- Check-in, como dueña de la pantalla.
- Lectura del sensor en vivo y contador de 60 s.
- Prueba de reacción.
- Respiración guiada y comparación antes/después.

**Zona de archivos:** `src/features/check-in/`, `src/features/sensor/`, `src/features/reaction/` y `src/features/breathing/`. Check-in incrusta los bloques de voz de Fernando y de resultado de Ariff sin modificar sus módulos.

### Fernando · voz, plataforma y comunicación con Tierra

**Historias:** HU-08, HU-09, HU-21, HU-22, HU-23, HU-24, HU-25 y HU-29.

**Módulos**

- Grabación, transcripción y extracción de la bitácora.
- Worker, API, D1 y sincronización entre dispositivos.
- Emergencias, registro del CMO y resumen SBAR.
- Retraso de comunicación y consola del cirujano.
- Recordatorios proactivos y reportes diario/semanal.
- Animación 3D y voz de Lunito: movimiento con datos, boca sincronizada con la voz, expresiones y gestos ([LUNITO-ARTE.md](LUNITO-ARTE.md)).

**Pantallas y superficies**

- Lunito 3D que Mateo incrusta en Mi Lunito.
- Bloque de bitácora por voz que Jenni incrusta en Check-in.
- Emergencia a bordo, contador, checklist y línea de tiempo.
- Consola de escritorio del cirujano de vuelo.
- Reporte diario.

**Zona de archivos:** `worker/`, `src/api/`, `src/features/voice/`, `src/features/emergency/`, `src/features/reports/` y los archivos 3D de Lunito en `src/features/lunito/` (`LunitoScene.tsx`, `LunitoGlb.tsx`, `LunitoPlaceholder.tsx`, `useLunitoMotion.ts`, `motion.ts`, `hueShift.ts` y los nuevos de boca y voz). Fernando es el único que modifica la configuración de D1 y Workers AI en `wrangler.jsonc`. Si para animar a Lunito necesita ajustar el código de Mateo que lo integra, lo hace sin cambiar su funcionalidad y lo avisa en el PR.

### Ariff · interpretación y botiquín

**Historias:** HU-11, HU-12, HU-13, HU-14, HU-19 y HU-20.

**Módulos**

- Estructura de la app, navegación y estilos globales.
- Línea base, RMSSD y semáforo por peligro.
- Cruce de síntomas con datos ambientales.
- Acciones del día.
- Protocolo de dolor de cabeza.
- Inventario del botiquín.

**Pantallas y superficies**

- Bloque de resultado e instrucciones que Jenni incrusta en Check-in.
- Botiquín y buscador de síntomas.
- Asistente de dolor de cabeza.
- Inventario.

**Zona de archivos:** `src/app/`, `src/domain/` y `src/features/medicine/`. Ariff es el único que modifica `src/App.tsx` y `src/index.css`. Toda lógica de salud es una función pura con pruebas junto al archivo y sigue [FUENTES.md](FUENTES.md).

### Angie · validación de salud y contenido

**Historias que revisa:** HU-09, HU-12 a HU-14 y HU-18 a HU-25. La implementación sigue perteneciendo a la persona indicada arriba.

**Responsabilidades**

- Mantener las reglas, contraindicaciones, dosis y fuentes en [FUENTES.md](FUENTES.md).
- Revisar que el lenguaje de acciones, botiquín y emergencia no diagnostique ni prometa resultados.
- Preparar los casos de prueba de contenido para Ariff y Fernando, incluidos los estados "pendiente de validar".

**Zona de archivos:** `docs/FUENTES.md` y, cuando exista, `src/content/health/`. Angie valida el contenido; Ariff conserva la propiedad de la lógica y Fernando la del flujo de emergencia.

### Viridiana · estación de hardware y arte 3D de Lunito

**Historias:** HU-03 y HU-06.

**Módulos y superficies**

- Firmware del ESP32 y lectura del MAX30102.
- Mensajes Bluetooth LE.
- Cuenta regresiva y pulso en la OLED.
- Calibración y detección de dedo.
- Arte 3D de Lunito en Blender: boca, expresiones, brazos y cola ([LUNITO-ARTE.md](LUNITO-ARTE.md)). Empieza cuando la estación ya manda datos.

**Zona de archivos:** `firmware/`, `art/lunito/` y `public/lunito.glb`. Viridiana acuerda con Jenni el mensaje Bluetooth; la app no depende de detalles internos del firmware. El modelo cumple el contrato de [LUNITO-ARTE.md](LUNITO-ARTE.md) §2 para que Fernando lo anime.

## Propiedad de las pantallas

| Pantalla o bloque                | Responsable | Integraciones                            |
| -------------------------------- | ----------- | ---------------------------------------- |
| Selección de perfil              | Mateo       | API de Fernando                          |
| Mi Lunito                        | Mateo       | Estado de Ariff y Lunito 3D de Fernando  |
| Tripulación (Constelación)       | Mateo       | Estado de Ariff y API de Fernando        |
| Check-in                         | Jenni       | Voz de Fernando y resultado de Ariff     |
| Prueba de reacción               | Jenni       | Línea base de Ariff                      |
| Respiración guiada               | Jenni       | Sensor de Jenni/Viridiana                |
| Mi estado                        | Mateo       | Estado y acciones de Ariff               |
| Botiquín                         | Ariff       | Feed de Mateo y persistencia de Fernando |
| Emergencia a bordo               | Fernando    | Caso y navegación de Ariff               |
| Consola del cirujano             | Fernando    | Datos de Ariff y persistencia propia     |
| Panel de demo                    | Mateo       | API de Fernando                          |
| Compañero y aviso del comandante | Mateo       | Estado de Ariff                          |

La persona responsable crea el archivo de la pantalla. Las integraciones llegan como propiedades, funciones o clientes; no dan permiso para editar el módulo ajeno.

## Contratos mínimos

Antes de desarrollar, se fijan solo estos contratos:

| Contrato                  | Responsable       | Consumidores            |
| ------------------------- | ----------------- | ----------------------- |
| Mensaje Bluetooth         | Jenni + Viridiana | Sensor de la app        |
| Borrador de check-in      | Jenni             | Fernando y Ariff        |
| Estado, motivo y acciones | Ariff             | Mateo, Jenni y Fernando |
| Caso, eventos y SBAR      | Fernando          | Mateo y Ariff           |
| Contenido de salud        | Angie             | Ariff y Fernando        |
| API y datos persistidos   | Fernando          | Mateo, Jenni y Ariff    |
| Modelo 3D de Lunito       | Viridiana         | Fernando                |

Cada responsable mantiene su contrato. Un cambio incompatible se hace en un PR pequeño y se avisa a sus consumidores antes de integrarlo.

## Orden sin bloqueos

1. **Contratos:** acordar ejemplos mínimos de los contratos y congelarlos para el primer P1.
2. **Trabajo paralelo:** cada carril implementa sus P1 con adaptadores o datos simulados.
3. **Integración:** conectar Worker, sensor y motor de interpretación sin cambiar las pantallas propietarias.
4. **Demo completa:** verificar el recorrido definido en [SISTEMA.md §11](SISTEMA.md).
5. **Después:** construir P2 y luego P3 solo si el flujo P1 permanece estable.

Orden interno recomendado:

- **Mateo:** HU-01 → HU-02 → HU-15 → HU-17 → HU-30 → HU-28.
- **Jenni:** HU-05 → HU-04 → HU-07 → HU-18.
- **Fernando:** HU-29 → HU-08 → HU-09 → HU-21 → HU-22 → HU-23.
- **Ariff:** HU-11 → HU-12 → HU-13 → HU-14 → HU-19.
- **Angie:** fuentes y casos de prueba de HU-12/HU-19 → contenido de HU-21/HU-22.
- **Viridiana:** HU-03; HU-06 queda para después del envío Bluetooth estable.

## Integración final

```text
Viridiana sensor ──> Jenni check-in ──> Ariff interpretación ──> Mateo Mi Lunito
                            │                    │
                            └─> Fernando voz     └─> Fernando Emergencia y Tierra

Mateo feed simulado ──> Ariff eventos ambientales y botiquín
Angie contenido ──> Ariff reglas y Fernando protocolos
Fernando API/D1 <────── todos los módulos mediante su cliente
Viridiana arte (lunito.glb) ──> Fernando Lunito 3D y voz ──> Mateo Mi Lunito
```

Los PR se pueden integrar aunque una flecha todavía use un adaptador simulado. La sustitución del adaptador es una tarea separada y pequeña.
