# Guía del sistema: monitoreo de salud de la tripulación

**NASA Space Apps Challenge 2026: reto de software de monitoreo de salud para astronautas**

> Documento de trabajo del equipo. Resume los criterios acordados, el concepto de la solución, los 5 peligros de NASA (RIDGE), lo que medimos, el hardware, los módulos, la meta común, las pantallas de la app y el plan de demo.

---

## 1. El sistema en una frase

Una app que junta todo lo que se sabe de la salud de cada astronauta (**lo que dice, lo que mide nuestro sensor y lo que ya registra la nave**), lo ordena según los **5 peligros del espacio definidos por NASA** y le dice a cada quien **qué hacer**.

**Pitch:** "No reinventamos los sensores de la nave; los conectamos con lo que la tripulación siente y mide, y lo convertimos en acciones organizadas por los 5 peligros de NASA".

---

## 2. Criterios de diseño (de nuestras notas)

### Lo que sí

- Variedad en inputs y outputs
- Gamificación
- IA integrada
- Compromiso en común y trabajo en equipo
- Eficiente, unificado y organizado
- Seguimiento, notificaciones, registros y reportes
- Proactivo
- Que el astronauta pueda autoevaluarse y actuar
- Mediciones → instrucciones → tratamiento

### Lo que no

- Dashboard genérico
- Modelo 3D del cuerpo humano
- "Doctor IA" (la IA no diagnostica)
- Nada abstracto
- Competencia entre tripulantes

### Comentarios recibidos

- Hacer más eficiente y organizado lo que ya tienen
- Trabajo en equipo y compromiso en común
- Mostrar el cambio en el tiempo
- **Salud mental** (punto destacado)

### Preguntas y pendientes

- ¿Cuándo alertar a los cirujanos en la Tierra? (respondido en la sección 7.4)
- Tomar en cuenta las apps de monitoreo que se usan en la Tierra
- Video de referencia: https://youtu.be/8BVuo8FRwR4?si=iE6HpFRPqnbYwTJv

---

## 3. Los 5 peligros del espacio (RIDGE)

NASA, a través de su Human Research Program, agrupa los riesgos de los vuelos espaciales en cinco peligros. En nuestra app son las **categorías** donde cae cada dato. NASA también señala que los peligros se potencian entre sí, por eso unificarlos tiene valor.

| Letra | Peligro                     | Qué significa                                                                                                       | Qué ya existe en la nave                                                                   | Qué agregamos nosotros                                                                                  |
| ----- | --------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **R** | Radiación                   | Partículas del Sol y del espacio que dañan el cuerpo a largo plazo; fuera de la Tierra no hay atmósfera que proteja | Dosímetros personales y activos (p. ej., Lumina, dosímetro de fibra óptica en tiempo real) | Dosis acumulada por persona frente a su límite; ante tormenta solar, instrucción de ir al área blindada |
| **I** | Aislamiento y confinamiento | Meses encerrados con las mismas personas: afecta sueño, ánimo, estrés y convivencia                                 | Monitores de sueño, iluminación LED, pruebas cognitivas                                    | Bitácora por voz, prueba de reacción, HRV del MAX30102, compañero del día, respiración guiada           |
| **D** | Distancia de la Tierra      | Entre más lejos, más tarda la ayuda; desde Marte un mensaje puede tardar más de 20 min                              | Apps separadas para medicamentos, síntomas y consumibles médicos                           | Botiquín unificado, modo retraso y la meta común de autonomía                                           |
| **G** | Gravedad                    | Sin gravedad se pierde hueso (1% a 1.5% de densidad ósea por mes) y músculo, y el corazón se desacondiciona         | Equipos de ejercicio T2, CEVIS y ARED (unos 600 min por semana)                            | Cumplimiento del ejercicio como indicador y recuperación del pulso con el MAX30102                      |
| **E** | Ambiente hostil o cerrado   | La nave es una burbuja: aire, temperatura, presión, ruido y microbios afectan a todos                               | Soporte de vida que monitorea el ambiente                                                  | Cruce del ambiente con síntomas y SpO2 de la tripulación                                                |

---

## 4. Glosario

- **Bitácora por voz:** el astronauta habla 30 s y la IA convierte lo que dice en datos ordenados.
- **Prueba de reacción:** minijuego de 1 minuto; se toca la pantalla cuando aparece una señal. Si tardas más que de costumbre, hay fatiga.
- **MAX30102:** sensor óptico de pulso y oxigenación; se pone el dedo encima.
- **Pulso:** latidos por minuto.
- **SpO2:** porcentaje de oxigenación de la sangre.
- **HRV (variabilidad cardiaca):** cuánto varía el tiempo entre latidos. Alta indica relajación y recuperación; baja indica estrés o cansancio.
- **Recuperación del pulso:** cuánto baja el pulso en el primer minuto después del ejercicio; indica condición cardiovascular.
- **Dosímetro:** aparato que mide cuánta radiación recibe una persona.
- **T2:** caminadora de la Estación Espacial.
- **CEVIS:** bicicleta fija de la Estación Espacial.
- **ARED:** máquina de pesas que simula cargar peso sin gravedad.
- **Feed de la nave:** datos que la nave ya genera (dosímetros, ejercicio, ambiente) y que nuestro sistema solo conecta.
- **Línea base personal:** el "normal" de cada astronauta, calculado con sus primeros días de misión.
- **Semáforo:** estado de cada persona (verde, amarillo o rojo), siempre con el motivo y el peligro que lo encendió.
- **Panel RIDGE:** cinco luces, una por peligro, que muestran el estado de la tripulación completa.
- **Cirujano de vuelo:** médico en Tierra responsable de la salud de la tripulación.

---

## 5. Cómo funciona: el ciclo

**Registrar → Interpretar → Actuar → Dar seguimiento**

1. **Registrar:** bitácora por voz + prueba de reacción + MAX30102 + feed de la nave.
2. **Interpretar:** cada dato se clasifica en su peligro, se compara con la línea base y se cruza con otras fuentes.
3. **Actuar:** instrucción del día, respiración guiada, botiquín, compañero del día y balanceador de carga.
4. **Dar seguimiento:** notificaciones, reportes y escalamiento a Tierra con el modo retraso.

La IA **transcribe, estructura, resume y guía protocolos ya cargados**. No diagnostica ni inventa tratamientos.

---

## 6. Entradas: qué medimos y de dónde sale

| Estado                                                             | Fuente                                                   | Peligro |
| ------------------------------------------------------------------ | -------------------------------------------------------- | ------- |
| Sueño y descanso                                                   | Voz                                                      | I       |
| Ánimo y estrés (salud mental)                                      | Voz + HRV + pulso en reposo                              | I       |
| Fatiga y alerta                                                    | Prueba de reacción + HRV                                 | I       |
| Condición cardiovascular                                           | Pulso en reposo y recuperación post-ejercicio (MAX30102) | G       |
| Cumplimiento de ejercicio                                          | Feed de la nave (T2, CEVIS, ARED)                        | G       |
| Oxigenación                                                        | SpO2 (MAX30102)                                          | E       |
| Calidad del aire de la cabina                                      | Feed de la nave (CO2, temperatura, presión, humedad)     | E       |
| Dosis de radiación                                                 | Feed de la nave (dosímetros)                             | R       |
| Síntomas físicos (mareo, congestión, dolor de cabeza o de espalda) | Voz                                                      | G, E    |
| Uso de medicamentos e inventario                                   | Botiquín                                                 | D       |

**Clave:** el sistema evalúa **tendencias de varios días**, no lecturas aisladas.

---

## 7. Módulos del sistema

### 7.1 Estación de check-in (hardware)

**Componentes**

- **ESP32** (procesamiento y conexión WiFi/Bluetooth)
- **Sensor MAX30102**
- **Pantalla OLED pequeña**
- Carcasa impresa en 3D o soporte tipo "pon el dedo aquí"

**Funcionamiento**

1. El astronauta selecciona su perfil y pone el dedo en el sensor.
2. Mientras mide (unos 60 s), hace su bitácora por voz.
3. El ESP32 envía a la app pulso, SpO2, HRV y frecuencia respiratoria estimada.
4. La OLED muestra "midiendo… 42 s" con un pulso animado.

**Limitaciones a declarar**

- El sensor falla si el dedo se mueve.
- La SpO2 **no es de grado médico**; se presenta como prototipo.
- El sensor de temperatura del MAX30102 mide **el chip, no el cuerpo**; no se usa como temperatura corporal.

### 7.2 Interpretación

- **Clasificación por peligro:** dosis → R; ánimo y HRV → I; ejercicio y recuperación → G; CO2 y SpO2 → E; botiquín y casos → D.
- **Línea base personal:** compara contigo mismo, no con rangos genéricos.
- **Cruce de datos:** ejemplo: CO2 alto + varios con dolor de cabeza + pulso elevado = **evento ambiental (E)**, no tres casos médicos. La instrucción es revisar la ventilación, no repartir analgésicos.
- **Semáforo con motivo:** "Amarillo · G: 3 días sin ARED y recuperación cardiaca más lenta".

### 7.3 Salidas accionables

- **Instrucción del día:** 1 a 3 acciones concretas.
- **Respiración guiada (I):** el pulso en vivo guía la respiración y se ve el antes y después de la HRV.
- **Botiquín inteligente (D):** síntoma → preguntas de descarte → pasos guiados → qué usar según el protocolo cargado. Descuenta inventario y avisa de faltantes o caducidad.
- **Compañero del día (I):** asigna a alguien para apoyar a quien está en amarillo, con una acción simple. El compañero ve la acción, **no los datos privados**.
- **Balanceador de carga (I, G, R):** si alguien está fatigado o lleva mucha radiación y tiene una tarea pesada (por ejemplo, una caminata espacial), propone cambiarla con alguien en verde. El comandante aprueba con un toque.

### 7.4 Escalamiento: cuándo alertar a Tierra

| Nivel       | Quién atiende               | Qué pasa                              |
| ----------- | --------------------------- | ------------------------------------- |
| 🟢 Verde    | El propio astronauta        | Autocuidado con instrucciones         |
| 🟡 Amarillo | Oficial médico a bordo      | Aviso, acciones y repetir la medición |
| 🔴 Rojo     | Cirujano de vuelo en Tierra | Se envía el paquete del caso          |

**Modo retraso de comunicación**

- Arma el paquete del caso agrupado por peligro: síntomas, tendencia de 7 días, lo ya administrado y el stock disponible.
- Muestra un contador del retraso ("respuesta estimada en 14:32") y las instrucciones provisionales del protocolo.
- Al llegar la respuesta, se convierte en checklist con seguimiento.

### 7.5 Seguimiento

- Notificaciones proactivas ("hace 4 h tomaste el analgésico, ¿cómo sigue el dolor?").
- Reporte diario y semanal por persona y por tripulación, agrupado por peligro y redactado por la IA.

---

## 8. Meta común: autonomía de la tripulación

**Qué es:** el porcentaje de situaciones de salud que la tripulación **resuelve a bordo por sí misma**, con el botiquín, el compañero del día, el balanceador y las instrucciones del sistema, sin depender de Tierra.

**Por qué:** responde directo al peligro **D**. Mientras más lejos esté la nave, más tarda la ayuda; una tripulación que llega a Marte necesita ser autosuficiente. Es justo lo que pide el reto: evaluar y actuar sobre su propia salud.

**Cómo funciona**

- Cada caso amarillo que la tripulación cierra a bordo suma a la autonomía.
- La meta sube por fases conforme aumenta la distancia (por ejemplo, órbita baja → tránsito → Marte), porque el retraso de comunicación también crece.
- En Inicio se muestra el indicador de autonomía de la tripulación, la meta de la fase actual y el desglose por peligro (por ejemplo, "E: 4 de 4 resueltos a bordo").
- Es una meta de **equipo**: no hay rankings individuales.

**Regla de seguridad (importante)**

- **Escalar correctamente un caso rojo también cuenta como éxito.** La meta nunca debe incentivar a esconder un problema grave para "no perder autonomía".
- Lo que se mide es **resolver bien**, no evitar a Tierra a toda costa.

---

## 9. Pantallas de la app

Navegación con barra inferior. Estética: modo oscuro tipo consola de nave, acentos verde, ámbar y rojo, tipografía grande (se usa flotando y con prisa).

1. **Inicio (tripulación)**
   - Indicador de **autonomía** con la meta de la fase actual.
   - **Panel RIDGE**: cinco luces de la tripulación.
   - Tarjeta por astronauta con semáforo, motivo y peligro.
   - Tarjeta del compañero del día.
   - Botón fijo **"Mi check-in"**.
2. **Check-in**
   - Micrófono grande con onda animada y contador de 30 s.
   - Estado del sensor MAX30102 en vivo.
   - Chips editables con los campos extraídos por la IA.
   - Prueba de reacción.
   - Cierre: semáforo e instrucción concreta.
3. **Mi estado**
   - Semáforo con motivo.
   - Cinco secciones R, I, D, G, E con gráficas de 7 días y línea punteada de la línea base.
   - "Qué hacer hoy": 1 a 3 acciones marcables.
4. **Botiquín**
   - Buscador de síntomas con íconos.
   - Asistente paso a paso.
   - Pestaña de inventario con barras de stock y alertas.
5. **Casos y Tierra**
   - Lista de casos abiertos por color y peligro.
   - Caso rojo: paquete enviado, contador del retraso e instrucciones provisionales.
   - Respuesta del cirujano convertida en checklist.

**Solo para el comandante:** notificación del balanceador ("¿Intercambiar la caminata espacial de A con B?") con botones de aprobar o rechazar.

---

## 10. Un día de ejemplo

1. **7:00.** Ana hace su check-in: habla 30 s con el dedo en el sensor. Dice que durmió mal y su HRV está baja.
2. El sistema la pone en **amarillo por I** ("estrés y mal sueño 2 días seguidos").
3. Le propone 5 min de respiración guiada y ve su pulso bajar.
4. Asigna a Luis como su compañero del día: "toma el café con Ana".
5. Ana tenía una caminata espacial; el balanceador propone moverla a Luis, que está en verde, y el comandante aprueba.
6. **Mediodía.** El feed marca CO2 alto en un módulo y dos personas reportan dolor de cabeza. La luz **E** se pone amarilla y la instrucción es revisar la ventilación. Se resuelve a bordo y **sube la autonomía**.
7. **Noche.** El reporte resume el día por peligro, listo para Tierra.

---

## 11. Plan de demo en vivo

1. Un integrante hace su check-in en reposo (voz + sensor) y queda en **verde**.
2. Hace 20 sentadillas, se mide otra vez, el pulso sube y la app lo detecta (**G**).
3. Hace la respiración guiada viendo su pulso bajar en pantalla (**I**).
4. Se dispara un evento simulado de CO2 alto: la luz **E** cambia, la tripulación lo resuelve y sube la autonomía.
5. Se muestra un caso **rojo** simulado con el paquete para Tierra y el contador de retraso (**D**).

Los datos del feed de la nave (dosímetros, ejercicio y ambiente) y el historial de días previos van **simulados y etiquetados**. El MAX30102 es el único sensor real, lo que refuerza el mensaje: no reinventamos sensores, los conectamos.

---

## 12. Prioridades de construcción (MVP)

| Prioridad | Entregable                                                           |
| --------- | -------------------------------------------------------------------- |
| 1         | Estación ESP32 + MAX30102 enviando datos a la app                    |
| 2         | Bitácora por voz → campos estructurados                              |
| 3         | Clasificación por peligro + semáforo con línea base y motivo         |
| 4         | Feed de la nave simulado (dosímetro, ejercicio, ambiente)            |
| 5         | Panel RIDGE e indicador de autonomía en Inicio                       |
| 6         | Respiración guiada con pulso en vivo                                 |
| 7         | Un flujo completo del botiquín (por ejemplo, dolor de cabeza)        |
| 8         | Caso rojo con paquete para Tierra y contador de retraso              |
| Extra     | Compañero del día y balanceador (pueden ir como pantallas simuladas) |

---

## Fuentes

- [NASA – The Human Body in Space](https://www.nasa.gov/humans-in-space/the-human-body-in-space/)
- [NASA Human Research Program – Five Hazards](https://www.nasa.gov/hrp/hazards)
- [NASA – Station research supporting Moon and Mars](https://nasa.gov/missions/station/iss-research/nasa-shares-station-research-today-supporting-moon-mars-tomorrow)
- [NASA NTRS – ISS research studies](https://ntrs.nasa.gov/api/citations/20170000811/downloads/20170000811.pdf)
- [npj Microgravity – Evaluación de contramedidas de ejercicio en la ISS](https://link.springer.com/10.1038/s41526-023-00256-5)
