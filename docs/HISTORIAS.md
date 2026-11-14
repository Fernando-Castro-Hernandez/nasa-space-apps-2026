# Historias de usuario

Historias del MVP, derivadas de [SISTEMA.md](SISTEMA.md) y del [PRD](PRD.md). Las reglas de salud y sus fuentes están en [FUENTES.md](FUENTES.md). No hubo transcripción de reunión: los "cambios" de abajo salen de contrastar el borrador del sistema (§5 a §12) con los criterios y comentarios que el propio equipo anotó (§2), las reglas de [AGENTS.md](../AGENTS.md) y la viabilidad técnica.

**Prioridades:** P1 = sin esto la demo no funciona · P2 = suma mucho, va después de P1 · P3 = solo si sobra tiempo.

---

## 1. Análisis de cambios

Cada cambio indica quién lo propone (perspectiva), por qué, qué cambia y qué historias afecta.

| #   | Perspectiva                    | Original (SISTEMA.md)                                             | Propuesta                                                                                                                                                                                 | Por qué                                                                                                                         | Afecta                     |
| --- | ------------------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| C1  | Arquitectura                   | §7.1: el ESP32 envía pulso, SpO2, HRV y frecuencia respiratoria   | El ESP32 envía pulso, SpO2 e intervalos entre latidos; la app calcula la HRV. La frecuencia respiratoria sale del MVP                                                                     | El cálculo en la app se prueba con Vitest y el firmware queda más simple. La frecuencia respiratoria no alimenta ninguna salida | HU-03, HU-11, HU-18        |
| C2  | Scrum Master                   | §12: el feed simulado es la prioridad 4                           | El feed y el historial simulados van antes del semáforo                                                                                                                                   | La línea base necesita días previos; sin ellos no hay semáforo que mostrar                                                      | HU-02, HU-11, HU-12        |
| C3  | Scrum Master                   | §9: la prueba de reacción está en el check-in; §12 no la incluye  | Queda como P2, fuera del flujo mínimo, y dura 3 minutos en lugar de 1                                                                                                                     | La demo de §11 no la usa; la versión de 1 minuto no está validada y la breve validada dura 3 (Basner 2011)                      | HU-10                      |
| C4  | Arquitectura                   | No existe                                                         | Nueva: grabar y reproducir sesiones del sensor                                                                                                                                            | La demo no puede depender de que el sensor funcione en el escenario, y cinco personas trabajan sin el hardware                  | HU-05                      |
| C5  | Arquitectura                   | §7.1: "el sensor falla si el dedo se mueve" (solo se declara)     | Nueva: la app detecta lectura inválida y pide repetir                                                                                                                                     | Una lectura mala que entra al semáforo genera alertas falsas                                                                    | HU-07                      |
| C6  | Scrum Master                   | §11: "se dispara un evento simulado"                              | Nueva: panel de demo para disparar eventos                                                                                                                                                | La demo necesita control explícito de los eventos simulados                                                                     | HU-28                      |
| C7  | Reglas de dominio              | §7.2: semáforo por desviación, sin umbrales                       | Amarillo cuando el indicador se aleja más de 0.5 DE de la línea base; cada regla cita fuente o se marca "pendiente de validar"; sin fuente no enciende rojo                               | AGENTS.md exige fuente para todo umbral; no hay fuente para un porcentaje fijo ([FUENTES.md](FUENTES.md))                       | HU-11, HU-12, HU-13, HU-14 |
| C8  | Producto                       | §2: "Gamificación" y a la vez "Sin competencia entre tripulantes" | La única mecánica de juego es la meta común de autonomía, sin rankings                                                                                                                    | Lo resuelven los comentarios recibidos: trabajo en equipo y compromiso en común                                                 | HU-17                      |
| C9  | Producto                       | §2: salud mental como punto destacado                             | La bitácora extrae ánimo y estrés como campos obligatorios; el peligro I aparece primero en Mi estado                                                                                     | Fue el comentario más remarcado                                                                                                 | HU-09, HU-16               |
| C10 | Producto                       | §2: "mostrar el cambio en el tiempo"                              | Gráficas de 7 días contra la línea base en Mi estado y en el paquete del caso                                                                                                             | Es el comentario recibido; ya estaba en §9, se vuelve criterio de aceptación                                                    | HU-16, HU-21               |
| C11 | Arquitectura                   | §5: la IA transcribe y estructura                                 | Workers AI dentro del mismo Worker (`whisper-large-v3-turbo` y `llama-3.1-8b-instruct` en modo JSON); respaldo con la Web Speech API de Chrome; si todo falla, los chips se llenan a mano | Gratis, sin llaves de API (se usan _bindings_) y el audio no sale de Cloudflare                                                 | HU-08, HU-09, HU-25        |
| C12 | Producto (decisión del equipo) | §7.1: una estación de check-in                                    | Perfiles tipo Netflix: cada quien entra desde su dispositivo y todos ven los mismos datos. Hay una sola estación con sensor                                                               | Decisión del equipo. Obliga a sincronizar datos: D1 en el mismo Worker                                                          | HU-01, HU-15, HU-29        |
| C13 | Arquitectura                   | §7.3: la respiración guiada muestra la HRV antes y después        | La métrica principal es el pulso antes y después; la HRV aparece como "estimada"                                                                                                          | Una HRV de 60 s con un sensor de dedo es ruidosa; el pulso es más confiable para la demo                                        | HU-18                      |
| C14 | Reglas de dominio              | §7.3: el botiquín sigue "el protocolo cargado"                    | El flujo de dolor de cabeza sale de [FUENTES.md §3](FUENTES.md): banderas rojas SNNOOP10, tratamiento en la ISS y CO2. Dosis pendiente de validar                                         | Una recomendación de tratamiento sin fuente viola AGENTS.md; la lista médica de la ISS no es pública                            | HU-19                      |
| C15 | Reglas de dominio              | §7.4: no define qué vuelve rojo un caso                           | Rojo solo por una bandera roja con fuente o porque el oficial médico lo marca. Del sensor, solo SpO2 ≤ 91 % o pulso ≤ 40 / ≥ 131 (NEWS2), confirmados en 2 lecturas                       | Evita inventar criterios clínicos                                                                                               | HU-12, HU-19, HU-21        |
| C16 | Seguridad                      | §7.3: el compañero "no ve los datos privados"                     | Se vuelve criterio de aceptación verificable                                                                                                                                              | Privacidad entre tripulantes                                                                                                    | HU-26                      |
| C17 | Reglas de dominio              | §3: "unos 600 min por semana" de ejercicio; Marte "más de 20 min" | Confirmadas: 600 min por semana en promedio (OCHMO-TB-031) y retraso Tierra–Marte de 4 a 24 min (NASA)                                                                                    | Cifras sin cita en SISTEMA.md                                                                                                   | HU-02, HU-22               |
| C18 | Producto (decisión del equipo) | §7.1: "WiFi/Bluetooth"                                            | Bluetooth (Web Bluetooth)                                                                                                                                                                 | Decisión del equipo; funciona en Chrome de escritorio y Android, no en iOS                                                      | HU-03, HU-04               |
| C19 | Producto (decisión del equipo) | §8: la meta sube por fases                                        | Meta de 100 % de situaciones bien atendidas en todas las fases; la fase solo cambia el retraso                                                                                            | Decisión del equipo: autonomía para actuar ante cualquier situación                                                             | HU-17                      |

**Cambios que tocan varias historias:** C1 (contrato de datos del sensor), C7 (motor del semáforo) y C11 (función de IA) conviene resolverlos primero, porque cambiarlos después obliga a rehacer varias historias.

---

## 2. Secuencia de implementación

El orden sigue las prioridades de §12 de SISTEMA.md, ajustadas por dependencias (C2) y por lo que necesita la demo de §11. Con seis personas, las historias se reparten en seis carriles (Hardware, Sensor en la app, Worker, Interpretación, Pantallas, Botiquín y escalamiento) que avanzan en paralelo.

| Orden | Historia | Carril                  | Por qué en este lugar                                                 |
| ----- | -------- | ----------------------- | --------------------------------------------------------------------- |
| 1     | HU-01    | Pantallas               | Todo depende de saber quién hace el check-in.                         |
| 2     | HU-29    | Worker                  | Los datos compartidos sostienen perfiles, check-ins y casos.          |
| 3     | HU-02    | Interpretación          | La línea base y el panel RIDGE necesitan datos desde la primera hora. |
| 4     | HU-03    | Hardware                | Prioridad 1 de §12; es el camino crítico más largo.                   |
| 5     | HU-05    | Sensor en la app        | Define el formato de sesión y desbloquea al resto sin hardware.       |
| 6     | HU-04    | Sensor en la app        | Conecta la estación con la app por Bluetooth.                         |
| 7     | HU-07    | Sensor en la app        | Evita que lecturas malas lleguen al semáforo.                         |
| 8     | HU-11    | Interpretación          | Base del semáforo.                                                    |
| 9     | HU-12    | Interpretación          | Prioridad 3 de §12; núcleo del producto.                              |
| 10    | HU-08    | Worker                  | Prioridad 2 de §12.                                                   |
| 11    | HU-09    | Worker                  | Completa la bitácora.                                                 |
| 12    | HU-14    | Interpretación          | Cierra el ciclo del check-in con una acción.                          |
| 13    | HU-15    | Pantallas               | Prioridad 5 de §12; primera pantalla que ve el jurado.                |
| 14    | HU-17    | Pantallas               | Completa Inicio con la meta común.                                    |
| 15    | HU-18    | Sensor en la app        | Prioridad 6 de §12; paso 3 de la demo.                                |
| 16    | HU-13    | Interpretación          | Paso 4 de la demo (evento de CO2).                                    |
| 17    | HU-28    | Botiquín y escalamiento | Dispara los pasos 4 y 5 de la demo.                                   |
| 18    | HU-19    | Botiquín y escalamiento | Prioridad 7 de §12; protocolo en FUENTES.md.                          |
| 19    | HU-21    | Botiquín y escalamiento | Prioridad 8 de §12; paso 5 de la demo.                                |
| 20    | HU-22    | Botiquín y escalamiento | Completa el caso rojo.                                                |
| 21    | HU-16    | Pantallas               | Muestra el cambio en el tiempo (C10).                                 |
| 22    | HU-20    | Botiquín y escalamiento | P2: completa el botiquín.                                             |
| 23    | HU-23    | Botiquín y escalamiento | P2: cierra el ciclo del caso rojo.                                    |
| 24    | HU-10    | Pantallas               | P2 (C3).                                                              |
| 25    | HU-06    | Hardware                | P2: pulido de la estación.                                            |
| 26    | HU-26    | Pantallas               | P3: extra de §12.                                                     |
| 27    | HU-27    | Pantallas               | P3: extra de §12.                                                     |
| 28    | HU-24    | Worker                  | P3.                                                                   |
| 29    | HU-25    | Worker                  | P3.                                                                   |

**Primer acuerdo del equipo (antes de escribir código):** el contrato de datos de una lectura del sensor y de un check-in, para que los carriles de hardware, sensor, interpretación y pantallas no se bloqueen entre sí.

---

## 3. Historias refinadas

### Base

#### HU-01 · Elegir mi perfil

**Como** astronauta **quiero** elegir mi perfil al empezar el check-in **para** que mis datos se guarden a mi nombre.

**Criterios de aceptación**

- Cualquier dispositivo que abra la app muestra los perfiles de la tripulación (nombre e inicial) con botones de 48 px o más, como en Netflix.
- Al elegir un perfil, todo dato del check-in queda asociado a ese perfil.
- Los perfiles de la demo vienen precargados; uno de ellos es el integrante que hace la demo en vivo.

**Prioridad:** P1 · **Dependencias:** ninguna · **Notas:** sin contraseñas, como los perfiles de Netflix (C12). Los datos se comparten entre dispositivos con HU-29.

#### HU-02 · Feed de la nave e historial simulados

**Como** astronauta **quiero** ver los datos que ya registra la nave (dosis, ejercicio y ambiente) junto a mis días previos **para** que mi estado se evalúe con todo el contexto y no con una sola lectura.

**Criterios de aceptación**

- Hay datos simulados de 14 días por astronauta: dosis acumulada, minutos de ejercicio en T2, CEVIS y ARED, y CO2, temperatura, presión y humedad de cabina.
- Los valores están calibrados con cifras publicadas y cada uno cita su fuente en el código.
- Todo dato simulado muestra la etiqueta "simulado" en la interfaz.
- Los datos se cargan desde un archivo, sin backend.

**Prioridad:** P1 · **Dependencias:** HU-01 · **Notas:** el promedio de 600 min de ejercicio por semana sale de OCHMO-TB-031 (C17).

#### HU-29 · Datos compartidos entre dispositivos

**Como** tripulación **queremos** que cada check-in se vea desde cualquier dispositivo **para** que cada quien abra su perfil donde esté, como en Netflix.

**Criterios de aceptación**

- El mismo Worker que sirve la app guarda perfiles, check-ins, casos y eventos en Cloudflare D1.
- Un check-in guardado en un dispositivo aparece en los demás en 10 s o menos.
- El Worker valida cada dato que recibe (tipos y rangos) y rechaza lo inválido con un error claro.
- El navegador no guarda llaves de API: D1 y Workers AI se usan con _bindings_ del Worker.

**Prioridad:** P1 · **Dependencias:** contrato de datos · **Notas:** las pantallas consultan cada pocos segundos en lugar de usar tiempo real; alcanza para la demo. Hoy `wrangler.jsonc` solo sirve archivos estáticos: hay que agregar el código del Worker y los _bindings_ de D1 y Workers AI.

### Sensor

#### HU-03 · Leer el MAX30102 en el ESP32

**Como** astronauta **quiero** poner el dedo en la estación y que se mida mi pulso y oxigenación **para** registrar datos reales sin equipo médico.

**Criterios de aceptación**

- El firmware del ESP32 lee el MAX30102 por I2C y calcula pulso (lpm), SpO2 (%) y los intervalos entre latidos (ms).
- Envía por Bluetooth LE un mensaje por segundo con esos valores y una marca de tiempo, en el formato del contrato de datos acordado.
- Si no hay dedo, envía un estado "sin dedo" en lugar de valores.
- La frecuencia de muestreo y los umbrales de detección son constantes ajustables al inicio del archivo, para calibrar en sitio.

**Prioridad:** P1 · **Dependencias:** contrato de datos · **Notas:** la temperatura del chip no se envía como temperatura corporal. La SpO2 no es de grado médico.

#### HU-04 · Recibir lecturas en vivo en la app

**Como** astronauta **quiero** ver en la app el estado del sensor y mis lecturas mientras mido **para** saber que la medición va bien.

**Criterios de aceptación**

- La app se conecta a la estación con un botón "Conectar sensor" y muestra conectado, desconectado o sin dedo.
- Muestra pulso y SpO2 actualizándose cada segundo y un contador de 60 s.
- Si la conexión se pierde, avisa con texto y permite reintentar sin perder la bitácora de voz en curso.

**Prioridad:** P1 · **Dependencias:** HU-03 · **Notas:** Web Bluetooth funciona en Chrome de escritorio y Android, no en iOS (C18). La estación se conecta al dispositivo de quien hace el check-in.

#### HU-05 · Grabar y reproducir sesiones del sensor

**Como** presentador de la demo **quiero** reproducir una sesión grabada del sensor **para** que la demo funcione aunque el hardware falle en el escenario.

**Criterios de aceptación**

- Una sesión en vivo se puede guardar como archivo con todas las lecturas y sus tiempos.
- La app puede usar un archivo de sesión en lugar del sensor; el resto de la app no nota la diferencia.
- Mientras se reproduce, la interfaz muestra la etiqueta "sesión grabada".
- El repo incluye al menos tres sesiones: reposo, después de 20 sentadillas y durante respiración guiada.

**Prioridad:** P1 · **Dependencias:** contrato de datos · **Notas:** también permite que el equipo desarrolle sin el hardware.

#### HU-06 · Cuenta regresiva en la pantalla OLED

**Como** astronauta **quiero** ver en la estación "midiendo… 42 s" con un pulso animado **para** saber cuánto falta sin mirar la app.

**Criterios de aceptación**

- La OLED muestra los segundos restantes y un ícono que late con cada pulso detectado.
- Al terminar muestra "listo" durante 3 s.

**Prioridad:** P2 · **Dependencias:** HU-03 · **Notas:** pulido; la app ya muestra lo mismo (HU-04).

#### HU-07 · Detectar una lectura inválida

**Como** astronauta **quiero** que la app me avise si moví el dedo **para** repetir la medición en lugar de guardar un dato falso.

**Criterios de aceptación**

- Si durante la medición hay "sin dedo" o saltos de pulso mayores al límite configurado, la app muestra "Mantén el dedo quieto" y reinicia el contador.
- Una medición con menos de 30 s válidos no se guarda ni entra al semáforo.
- La regla de validez es una función pura con pruebas en Vitest.

**Prioridad:** P1 · **Dependencias:** HU-04 · **Notas:** el límite de salto es un parámetro de calibración, no un umbral clínico.

### Check-in

#### HU-08 · Grabar la bitácora por voz

**Como** astronauta **quiero** hablar 30 s sobre cómo me siento mientras mido **para** registrar mi estado sin escribir.

**Criterios de aceptación**

- Un botón de micrófono grande graba hasta 30 s con onda animada y contador.
- Al terminar, el Worker transcribe el audio con Workers AI (`whisper-large-v3-turbo`, idioma español) y la transcripción aparece como texto editable.
- Si el Worker falla, se intenta con la Web Speech API de Chrome; si tampoco funciona, se escribe el texto a mano.

**Prioridad:** P1 · **Dependencias:** HU-01, HU-29 · **Notas:** la grabación y la medición del sensor ocurren al mismo tiempo (§7.1).

#### HU-09 · Convertir la bitácora en campos editables

**Como** astronauta **quiero** que lo que dije se convierta en datos ordenados que puedo corregir **para** no llenar formularios y que el sistema entienda mi estado.

**Criterios de aceptación**

- De la transcripción se extraen: horas y calidad de sueño, ánimo (1 a 5), estrés (1 a 5) y síntomas de una lista cerrada (mareo, congestión, dolor de cabeza, dolor de espalda, otro).
- Cada campo aparece como chip editable; el astronauta confirma antes de guardar.
- La IA no agrega diagnósticos ni recomendaciones en esta salida; si el texto pide algo así, se ignora.
- La extracción usa Workers AI (`llama-3.1-8b-instruct`, modo JSON). La respuesta se valida contra el esquema y, si no lo cumple, se reintenta una vez.
- Si la IA no responde en 10 s o falla el reintento, los chips aparecen vacíos para llenarse a mano.

**Prioridad:** P1 · **Dependencias:** HU-08 · **Notas:** ánimo y estrés son obligatorios (C9).

#### HU-10 · Prueba de reacción

**Como** astronauta **quiero** hacer una prueba de reacción de 3 minutos **para** saber si estoy más fatigado que de costumbre.

**Criterios de aceptación**

- La pantalla muestra una señal en intervalos aleatorios durante 3 minutos y registra el tiempo de cada toque.
- Cuenta como lapso un tiempo de reacción mayor a 355 ms.
- Al final muestra el tiempo medio y los lapsos, comparados con mi línea base.
- Un toque antes de la señal cuenta como error.

**Prioridad:** P2 · **Dependencias:** HU-11 · **Notas:** sigue la PVT-B validada (3 min, lapso > 355 ms; [Basner 2011](https://www.med.upenn.edu/uep/assets/user-content/documents/Basner2011-ValidityandsensitivityofabriefPVT.pdf)). La regla de amarillo para lapsos está pendiente de validar (C3).

### Interpretación

#### HU-11 · Calcular mi línea base personal

**Como** astronauta **quiero** que mis datos se comparen contra mi propio "normal" **para** que el sistema detecte cambios en mí y no contra un promedio genérico.

**Criterios de aceptación**

- La línea base de cada indicador (pulso en reposo, HRV, SpO2, sueño, ánimo, estrés) se calcula como media y desviación estándar de los 7 días previos al vuelo (14 en misiones largas).
- La HRV se calcula en la app como RMSSD a partir de los intervalos entre latidos (C1).
- Con menos de 7 días de datos (6 noches para el sueño), el indicador muestra "línea base insuficiente" y no cambia el semáforo.
- Las funciones de línea base y RMSSD son puras y tienen pruebas en Vitest, incluidas listas vacías y valores atípicos.

**Prioridad:** P1 · **Dependencias:** HU-02 · **Notas:** NASA toma la línea base antes del vuelo; mínimos y fuentes en [FUENTES.md §1](FUENTES.md). En la demo, los días previos al vuelo van simulados.

#### HU-12 · Semáforo por peligro con motivo

**Como** astronauta **quiero** ver mi estado en verde, amarillo o rojo con el motivo y el peligro que lo encendió **para** entender qué pasa y no solo un color.

**Criterios de aceptación**

- Cada dato se clasifica en su peligro: dosis → R; ánimo, estrés, sueño y HRV → I; ejercicio y recuperación → G; CO2 y SpO2 → E; botiquín y casos → D.
- El estado se basa en la tendencia de varios días, no en una sola lectura.
- Cada color muestra el motivo en texto ("Amarillo · G: 3 días sin ARED y recuperación más lenta") y la fuente de la regla, o "pendiente de validar".
- Una regla sin fuente puede dar amarillo pero nunca rojo (C7, C15).
- SpO2 ≤ 91 %, pulso ≥ 131 lpm, o pulso ≤ 40 lpm por debajo de la línea base − 0.5 DE, en reposo, dan rojo solo si una segunda lectura de 60 s lo confirma; si no, se muestra "lectura dudosa, repite" (NEWS2).
- El motor del semáforo es una función pura con pruebas en Vitest para cada regla.

**Prioridad:** P1 · **Dependencias:** HU-11 · **Notas:** amarillo cuando el indicador se aleja más de 0.5 DE de la línea base. Reglas por indicador y fuentes en [FUENTES.md](FUENTES.md).

#### HU-13 · Detectar eventos ambientales en la tripulación

**Como** oficial médico a bordo **quiero** que el sistema reconozca cuando varios síntomas vienen del ambiente **para** revisar la ventilación en lugar de tratar a cada persona por separado.

**Criterios de aceptación**

- Si el CO2 de un módulo supera 3 mmHg en promedio de 1 h y dos o más tripulantes reportan dolor de cabeza el mismo día, se crea un evento ambiental (E) en lugar de casos individuales.
- La luz E del panel RIDGE se pone amarilla y la instrucción es "Revisar la ventilación del módulo X".
- Al marcar el evento como resuelto, la luz vuelve a verde y cuenta para la autonomía.
- La regla es una función pura con pruebas en Vitest.

**Prioridad:** P1 · **Dependencias:** HU-02, HU-09, HU-12 · **Notas:** umbral de CO2 según OCHMO-TB-004. "Dos o más tripulantes" es regla de diseño, no clínica.

#### HU-14 · Cierre del check-in con la instrucción del día

**Como** astronauta **quiero** terminar el check-in con mi semáforo y de 1 a 3 acciones concretas **para** saber exactamente qué hacer hoy.

**Criterios de aceptación**

- Al guardar el check-in se muestra el semáforo con motivo (HU-12) y de 1 a 3 acciones marcables.
- Cada acción viene de una lista precargada asociada a una regla; la IA no inventa acciones.
- En verde, la acción puede ser "Sin cambios, sigue tu rutina".
- Se muestra el aviso "Prototipo, no diagnóstico".

**Prioridad:** P1 · **Dependencias:** HU-12 · **Notas:** las acciones de salud necesitan fuente o la etiqueta "pendiente de validar".

### Pantallas

#### HU-15 · Inicio con el panel RIDGE

**Como** oficial médico a bordo **quiero** ver de un vistazo el estado de toda la tripulación por peligro **para** saber dónde actuar primero.

**Criterios de aceptación**

- Inicio muestra cinco luces (R, I, D, G, E) con el peor estado de la tripulación en cada peligro.
- Debajo, una tarjeta por astronauta con semáforo, motivo y peligro.
- Un botón fijo "Mi check-in" abre el check-in desde cualquier parte de Inicio.
- Cada luz tiene texto además del color.

**Prioridad:** P1 · **Dependencias:** HU-12 · **Notas:** modo oscuro tipo consola, acentos verde, ámbar y rojo (§9). Puede requerir diseño de UI antes de construir.

#### HU-16 · Mi estado con tendencia de 7 días

**Como** astronauta **quiero** ver cómo cambiaron mis indicadores en los últimos 7 días contra mi línea base **para** entender mi tendencia y no solo el día de hoy.

**Criterios de aceptación**

- Hay cinco secciones R, I, D, G y E; I aparece primero (C9).
- Cada indicador tiene una gráfica de 7 días con la línea base punteada.
- "Qué hacer hoy" muestra las acciones de HU-14 con casilla para marcar.

**Prioridad:** P2 · **Dependencias:** HU-11, HU-14 · **Notas:** requiere elegir librería de gráficas (abierto en DECISIONS.md). Requiere diseño de UI.

#### HU-17 · Indicador de autonomía de la tripulación

**Como** tripulación **queremos** ver qué porcentaje de casos resolvemos a bordo frente a la meta de la fase **para** trabajar juntos hacia ser autosuficientes.

**Criterios de aceptación**

- Inicio muestra el porcentaje de autonomía, la meta de 100 %, la fase actual (órbita baja, tránsito o Marte) y el desglose por peligro ("E: 4 de 4 resueltos a bordo").
- Un caso amarillo cerrado a bordo suma a la autonomía.
- Un caso rojo escalado correctamente a Tierra también cuenta como éxito; nunca resta.
- No hay métricas individuales ni rankings.
- El cálculo es una función pura con pruebas en Vitest, incluido el caso rojo escalado.

**Prioridad:** P1 · **Dependencias:** HU-12; cuenta los casos de HU-13 y HU-21 cuando existan (mientras tanto, casos simulados) · **Notas:** la meta de 100 % de situaciones bien atendidas en todas las fases es decisión del equipo (C19, [FUENTES.md §4](FUENTES.md)), no umbral de salud.

### Acciones

#### HU-18 · Respiración guiada con pulso en vivo

**Como** astronauta **quiero** seguir una respiración guiada mientras veo mi pulso **para** bajar el estrés y comprobar que funcionó.

**Criterios de aceptación**

- Una animación marca inhalar y exhalar durante 5 minutos, con opción de terminar antes.
- El pulso en vivo se muestra durante toda la sesión.
- Al final se muestra el pulso antes y después; la HRV antes y después aparece marcada como "estimada" (C13).
- Funciona igual con el sensor o con una sesión grabada (HU-05).

**Prioridad:** P1 · **Dependencias:** HU-04 o HU-05, HU-11 · **Notas:** el ritmo de respiración necesita fuente o la etiqueta "pendiente de validar".

#### HU-19 · Botiquín: flujo de dolor de cabeza

**Como** astronauta **quiero** que el botiquín me guíe paso a paso desde mi síntoma **para** tratarlo a bordo sin esperar a Tierra.

**Criterios de aceptación**

- Desde el buscador de síntomas, "dolor de cabeza" abre un asistente: preguntas de descarte → pasos guiados → qué usar.
- Si una pregunta de descarte (bandera roja) da positivo, el caso pasa a rojo y se arma el paquete para Tierra (HU-21).
- El uso repetido de analgésicos o la falta de alivio pasan el caso a amarillo (oficial médico).
- El contenido sale de un protocolo cargado como datos, con su fuente visible.
- Antes de recomendar un medicamento, el asistente revisa si el CO2 de cabina está alto y lo sugiere primero (cruce con HU-13).

**Prioridad:** P1 · **Dependencias:** HU-13 · protocolo, preguntas de contraindicación y dosis del botiquín de la ISS en [FUENTES.md §3](FUENTES.md) · **Notas:** requiere diseño de UX del asistente.

#### HU-20 · Inventario del botiquín

**Como** oficial médico a bordo **quiero** que el inventario se actualice solo **para** saber qué falta antes de que se acabe.

**Criterios de aceptación**

- Al completar un flujo del botiquín que usa un medicamento, se descuenta del inventario.
- La pestaña de inventario muestra barras de stock y alertas de faltante y de caducidad.
- El umbral de "faltante" es configurable por artículo.

**Prioridad:** P2 · **Dependencias:** HU-19 · **Notas:** inventario simulado.

### Escalamiento

#### HU-21 · Armar el paquete del caso para Tierra

**Como** cirujano de vuelo **quiero** recibir un paquete completo y ordenado de cada caso rojo **para** decidir sin pedir más datos y perder otro ciclo de comunicación.

**Criterios de aceptación**

- Un caso pasa a rojo por una regla con fuente o porque el oficial médico lo marca (C15).
- El paquete agrupa por peligro: síntomas, tendencia de 7 días, lo ya administrado y el stock disponible.
- El paquete se puede ver en pantalla y descargar como archivo.

**Prioridad:** P1 · **Dependencias:** HU-12, HU-16 o los datos de HU-02 · **Notas:** el envío a Tierra es simulado.

#### HU-22 · Modo retraso de comunicación

**Como** astronauta **quiero** ver cuánto tardará la respuesta de Tierra y qué hacer mientras tanto **para** no quedarme sin guía durante la espera.

**Criterios de aceptación**

- Al enviar el paquete, se muestra un contador "respuesta estimada en mm:ss" según la fase de la misión.
- Debajo aparecen las instrucciones provisionales del protocolo cargado.
- El retraso de cada fase es configurable.

**Prioridad:** P1 · **Dependencias:** HU-21 · **Notas:** retraso Tierra–Marte de 4 a 24 min en un sentido ([NASA](https://www.nasa.gov/centers-and-facilities/goddard/space-communications-7-things-you-need-to-know/)).

#### HU-23 · Respuesta del cirujano como checklist

**Como** astronauta **quiero** que la respuesta de Tierra se convierta en una lista de pasos marcables **para** seguirla sin perder ningún paso.

**Criterios de aceptación**

- Al llegar la respuesta (simulada), se muestra como checklist dentro del caso.
- El caso se cierra cuando todos los pasos están marcados y cuenta para la autonomía (HU-17).

**Prioridad:** P2 · **Dependencias:** HU-22 · **Notas:** la respuesta viene precargada en la demo.

### Seguimiento

#### HU-24 · Notificaciones proactivas

**Como** astronauta **quiero** que el sistema me pregunte cómo sigo después de una acción **para** que mi caso tenga seguimiento sin tener que acordarme.

**Criterios de aceptación**

- 4 h después de usar un medicamento del botiquín llega "¿Cómo sigue el dolor?" con respuestas rápidas.
- La respuesta se guarda en el caso.

**Prioridad:** P3 · **Dependencias:** HU-19 · **Notas:** en la demo el tiempo de espera se puede acortar desde el panel de demo.

#### HU-25 · Reporte diario por peligro

**Como** cirujano de vuelo **quiero** un reporte diario de la tripulación agrupado por peligro **para** revisar el día en un minuto.

**Criterios de aceptación**

- El reporte agrupa por peligro los cambios de semáforo, casos abiertos y cerrados y acciones completadas.
- La IA redacta el resumen solo con los datos del día; cada afirmación se puede rastrear a un dato.
- Si la IA no responde, el reporte se muestra en forma de lista sin redacción.

**Prioridad:** P3 · **Dependencias:** HU-12, función de IA (C11) · **Notas:** el reporte semanal queda fuera del MVP.

### Trabajo en equipo

#### HU-26 · Compañero del día

**Como** astronauta en amarillo **quiero** que alguien de la tripulación tenga una acción simple para apoyarme **para** no enfrentar solo un mal día.

**Criterios de aceptación**

- Cuando alguien queda en amarillo por I, se asigna a un tripulante en verde con una acción simple ("toma el café con Ana").
- El compañero ve la acción y el nombre, nunca los datos de salud ni el motivo del semáforo.
- Inicio muestra la tarjeta del compañero del día.

**Prioridad:** P3 · **Dependencias:** HU-12, HU-15 · **Notas:** puede ir como pantalla simulada (§12).

#### HU-27 · Balanceador de carga

**Como** comandante **quiero** que el sistema me proponga cambiar una tarea pesada de alguien fatigado a alguien en verde **para** reducir riesgos sin revisar los datos de cada persona.

**Criterios de aceptación**

- Si un tripulante en amarillo (I, G o R) tiene una tarea pesada asignada, el comandante recibe "¿Intercambiar la caminata espacial de A con B?", donde B está en verde.
- Aprobar o rechazar es un solo toque; la decisión queda registrada.
- La propuesta muestra solo el peligro, no los datos de salud.

**Prioridad:** P3 · **Dependencias:** HU-12 · **Notas:** las tareas de la tripulación son simuladas. Puede ir como pantalla simulada (§12).

### Demo

#### HU-28 · Panel de control de la demo

**Como** presentador de la demo **quiero** disparar eventos simulados con un botón **para** mostrar cada paso de la demo en el momento justo.

**Criterios de aceptación**

- Un panel oculto (por ejemplo, en `/demo`) tiene botones para: subir el CO2 de un módulo, crear un caso rojo y reiniciar los datos de la demo.
- Cada evento se marca como "simulado" en la interfaz.
- Reiniciar deja la app en el estado inicial de la demo de §11.

**Prioridad:** P1 · **Dependencias:** HU-02 · **Notas:** no se muestra en la navegación normal.

---

## 4. Preguntas abiertas

Resueltas con el equipo y la investigación:

1. **Conexión:** Bluetooth (C18).
2. **IA:** Workers AI en el mismo Worker, gratis y sin llaves (C11).
3. **Protocolo del botiquín:** [FUENTES.md §3](FUENTES.md) (C14).
4. **Desviación para amarillo:** 0.5 DE de la línea base, no porcentaje (C7).
5. **Autonomía:** 100 % de situaciones bien atendidas en todas las fases (C19).
6. **Dispositivos:** perfiles tipo Netflix con datos compartidos (C12).

Siguen abiertas:

- Ninguna bloquea historias. Lo que falta verificar está en [FUENTES.md §5](FUENTES.md).

Resueltas en la segunda ronda: dosis (botiquín de la ISS, NASA 2015), línea base de 7 días previos al vuelo y rojo por SpO2 y pulso (NEWS2). Decisiones del equipo: la lista del botiquín de 2015 se toma como vigente, el rojo se confirma con 2 lecturas y el pulso bajo se compara con la línea base. Ver [FUENTES.md](FUENTES.md).

## 5. Supuestos

- Hay una sola estación con sensor; se conecta por Bluetooth al dispositivo de quien hace su check-in.
- El MAX30102 es el único sensor real; todo lo demás va simulado y etiquetado.
- La demo se presenta en Chrome (escritorio o Android) con un hotspot propio.

## 6. Deuda técnica aceptada

- Perfiles sin contraseña y sincronización por consultas periódicas, no en tiempo real.
- Envío a Tierra, respuesta del cirujano y tareas de la tripulación simulados.
- La HRV de 60 s con sensor de dedo es una estimación; no se valida contra ECG.
- Reglas de diseño sin fuente clínica ("dos o más tripulantes", 7 días de línea base, metas de autonomía) quedan fijas en código y documentadas como decisiones de diseño.
