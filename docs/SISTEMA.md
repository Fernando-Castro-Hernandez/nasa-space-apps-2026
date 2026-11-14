# Guía del sistema: monitoreo de salud de la tripulación

**NASA Space Apps Challenge 2026: reto de software de monitoreo de salud para astronautas**

> Documento de trabajo del equipo. Resume los criterios acordados, el concepto de la solución, los 5 peligros de NASA (RIDGE), lo que medimos, el hardware, los módulos, la meta común, las pantallas de la app y el plan de demo.

---

## 1. El sistema en una frase

Una app que junta todo lo que se sabe de la salud de cada astronauta (**lo que dice, lo que mide nuestro sensor y lo que ya registra la nave**), lo ordena según los **5 peligros del espacio definidos por NASA** y le dice a cada quien **qué hacer**.

**Pitch:** "No reinventamos los sensores de la nave; los conectamos con lo que la tripulación siente y mide, y lo convertimos en acciones organizadas por los 5 peligros de NASA".

### Lunito: un agente por astronauta

Cada astronauta tiene a **Lunito**, un personaje que es la cara de su agente. En vez de un panel de números, lo primero que ves es a tu Lunito: **su pancita es tu semáforo** (verde, ámbar o rojo) y su expresión acompaña tu estado. Hablarle es el check-in por voz; poner el dedo en el sensor es "darle la mano". Él te recuerda tus tareas y te propone acciones. Diseño visual en [DISENO.md](DISENO.md).

**Por qué:** un recordatorio genérico se ignora; "Lunito está cansado, ¿hacemos tu check-in?" no tanto. El vínculo sube la adherencia y pone la salud mental, punto destacado de los comentarios, en el centro.

**Tres capas**

1. **Mi Lunito** (inicio): Lunito, tu estado en palabras, el motivo y el botón de check-in.
2. **La constelación** (tripulación): los Lunitos de todos. Ves cómo está cada quien a grandes rasgos, le mandas ánimo y ves al compañero del día.
3. **El detalle** (Mi estado): el dashboard con números, gráficas de 7 días y línea base. Siempre a un toque de Lunito.

**Reglas para que Lunito no se vuelva en contra**

1. **Lunito refleja, nunca sufre.** No se enferma ni se muere cuando estás mal: si fuera así, aprenderías a mentirle en el check-in para "protegerlo". Cuando estás mal, te cuida.
2. **Se premian acciones, no valores.** Tu pulso no lo controlas; hacer la respiración guiada, el check-in o el ejercicio, sí. Los premios salen de completar tareas.
3. **El estado nunca va solo en la cara.** Siempre color más una palabra ("Revisar · sueño").
4. **Privacidad en la constelación.** Los demás ven el ánimo general que tú decidas compartir, nunca números. Un rojo no se muestra a la tripulación: va al oficial médico.
5. **Lunito habla, pero no diagnostica.** Es la misma IA del sistema: transcribe, resume y guía protocolos ya cargados.

**En una emergencia** (ver 7.5) desaparece todo lo lúdico. El Lunito del afectado se vuelve una baliza calma en rojo con su nombre y la hora, sin gesto de sufrimiento, y los demás Lunitos de la constelación giran hacia él. RIDGE sigue vivo en la vista del comandante y del oficial médico, y como etiqueta de "por qué importa" en cada indicador.

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
- **Lunito:** el personaje que representa al agente de cada astronauta; su pancita muestra el semáforo.
- **Constelación:** la vista de la tripulación, con el Lunito de cada quien.
- **Oficial médico (CMO):** tripulante entrenado para atender emergencias a bordo; casi nunca es médico.
- **SBAR:** formato para pasar un caso: Situación, Antecedentes, Evaluación y qué se pide (Recomendación).

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

### ¿Basta un check-in de 60 s?

Es la primera pregunta que nos harán. Respuesta corta: **sí para tendencias, no para eventos agudos**, y así lo decimos.

- **Así se monitorea hoy la ISS.** Exámenes mensuales entre tripulantes y una conferencia médica privada semanal con el cirujano ([Roden & Ewert, NASA 2006](https://ntrs.nasa.gov/api/citations/20060051792/downloads/20060051792.pdf); [NASA, podcast de consolas médicas](https://www.nasa.gov/podcasts/houston-we-have-a-podcast/mission-control-crew-health-consoles)). Los cuestionarios de sueño son mensuales y las pruebas cognitivas, en fechas fijas ([Standard Measures](https://ntrs.nasa.gov/api/citations/20180002943/downloads/20180002943.pdf)). Nuestro check-in diario es **más frecuente** que eso.
- **Una medición corta y estandarizada es válida para ver tendencias.** 60 s de HRV en reposo equivalen a 5 min ([Esco & Flatt 2014](https://www.jssm.org/jssm-13-535.xml-abst)); con 3 lecturas válidas por semana basta ([Plews 2014](https://doi.org/10.1123/ijspp.2013-0455)). La prueba de reacción de 3 min está validada ([Basner 2011](https://pmc.ncbi.nlm.nih.gov/articles/PMC3197786)). La FDA dice que la SpO2 sirve más para tendencias que para valores aislados.
- **Hasta en un hospital el monitoreo continuo se reserva para los graves.** Con NEWS2, a un paciente estable se le toman signos cada 12 h; el monitoreo continuo empieza con un puntaje de 7 o más ([RCP, NEWS2](https://www.rcp.ac.uk/media/mrllczrj/news2-chart-4_clinical-response-to-news-trigger-thresholds_0.pdf)).
- **El monitoreo continuo tiene costos.** Entre 72 % y 99 % de las alarmas del monitoreo continuo son falsas ([AHRQ](https://www.ncbi.nlm.nih.gov/books/NBK555522/)), y la PPG de muñeca falla con el movimiento ([revisión](https://pmc.ncbi.nlm.nih.gov/articles/PMC6387309)).
- **Lo que no hacemos y lo decimos:** el check-in no detecta eventos agudos ni nocturnos (arritmias, desaturación al dormir, desmayos). Para eso existen wearables como el Bio-Monitor de la CSA, que mide ECG, presión, respiración, temperatura y SpO2 ([CSA](https://www.asc-csa.gc.ca/eng/sciences/astroskin.asp)). Nuestro sistema **los complementa, no los reemplaza**: si existe ese feed, entra igual que el de los dosímetros. No encontramos una vía oficial de integración, así que en la demo es una posibilidad futura.
- **Lo que el wearable no da y nosotros sí:** cómo se siente la persona (voz), su fatiga (prueba de reacción), el contexto de la nave y una acción concreta. Un número sin interpretación no ayuda a nadie a actuar.
- **Límite del sensor:** el MAX30102 no está validado para HRV ni SpO2; mostramos tendencias, nunca diagnósticos.

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

| Nivel         | Quién atiende                              | Qué pasa                                       |
| ------------- | ------------------------------------------ | ---------------------------------------------- |
| 🟢 Verde      | El propio astronauta                       | Autocuidado con instrucciones                  |
| 🟡 Amarillo   | Oficial médico a bordo                     | Aviso, acciones y repetir la medición          |
| 🔴 Rojo       | Cirujano de vuelo en Tierra                | Se envía el paquete del caso                   |
| 🚨 Emergencia | Oficial médico a bordo + cirujano de vuelo | Alguien no puede valerse por sí mismo; ver 7.5 |

**Modo retraso de comunicación**

- Arma el paquete del caso agrupado por peligro: síntomas, tendencia de 7 días, lo ya administrado y el stock disponible.
- Muestra un contador del retraso ("respuesta estimada en 14:32") y las instrucciones provisionales del protocolo.
- Al llegar la respuesta, se convierte en checklist con seguimiento.

### 7.5 Emergencia: cuando alguien no puede hacer su check-in

**Cómo funciona hoy de verdad.** En la ISS hay al menos dos oficiales médicos a bordo (CMO). Casi nunca son médicos: tienen unas 25 h de entrenamiento y actúan como "extensión" del cirujano de vuelo ([Hailey, NASA 2011](https://ntrs.nasa.gov/api/citations/20110010924/downloads/20110010924.pdf); [Hurst, NASA](https://ntrs.nasa.gov/api/citations/20070030123/downloads/20070030123.pdf)). En Tierra atienden el cirujano de vuelo y un ingeniero biomédico (BME), que baja los datos fisiológicos ([NASA, BME](https://www.nasa.gov/directorates/esdmd/hhp/biomedical-flight-controllers/)). El CMO sigue la ISS Medical Checklist con el equipo de soporte vital avanzado.

**Lo que falla hoy, según NASA** ([Smith, AsMA 2025](https://ntrs.nasa.gov/api/citations/20250004859/downloads/CHP-IDSP_AsMA%202025.pdf)):

- La tripulación le cuenta el caso al cirujano **de palabra**, y el cirujano lo apunta en Word u OneNote para transcribirlo después.
- En Tierra **no siempre saben que hay datos nuevos** listos para bajar, sobre todo en eventos no programados.
- La tripulación **no tiene a bordo** su historial médico.
- La evaluación depende de comunicación casi en tiempo real, que hacia Marte no existe (4 a 24 min de retraso).

Nuestro flujo ataca esos cuatro puntos. Sigue el flujo que NASA propone para su futuro expediente médico de exploración (mismo documento): abrir el caso avisa a Tierra, los signos se cargan solos, el CMO completa y envía, y el cirujano responde sobre el mismo caso.

**El flujo**

1. **Disparo (un toque).** Cualquier tripulante pulsa **Emergencia** y elige a quién le pasa. El sensor no detecta desmayos solo, así que siempre lo dispara una persona. Un rojo del check-in también puede abrir el caso.
2. **Aviso inmediato a Tierra.** Al abrirse el caso sale un primer paquete sin esperar a nadie: quién, qué pasó, hora, último check-in, tendencia de 7 días, línea base, medicamentos tomados, alergias y antecedentes. En Tierra aparece como caso nuevo, no como un archivo que hay que ir a buscar.
3. **Guía para el CMO.** La app muestra el protocolo cargado como checklist paso a paso. Los pasos clínicos salen de la checklist médica oficial; los nuestros van marcados **pendiente de validar** hasta tener fuente.
4. **Registro del caso.** Cada paso marcado, cada lectura del sensor y cada medicamento quedan con hora, por toque o por voz ("le di oxígeno a las 14:05"). El CMO no escribe notas: atiende, y la app arma el registro. Esto reemplaza el "te lo cuento y tú lo apuntas".
5. **Resumen para Tierra en formato SBAR.** Situación, antecedentes, evaluación y qué se pide. Se actualiza solo con cada cambio y se reenvía. SBAR es el formato con mejor evidencia para pasar un caso a distancia, como por teléfono ([revisión, BMJ Open 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC6112409)).
6. **Respuesta de Tierra.** El cirujano responde sobre el mismo caso; su indicación llega como checklist nueva y el CMO recibe aviso. Mientras tanto se ve el contador del retraso.
7. **Sin comunicación.** El CMO sigue con el protocolo cargado y todo queda registrado. El paquete se envía cuando vuelve el enlace (almacenar y reenviar, que NASA-STD-3001 contempla para misiones con retraso: [NASA, Medical Operations](https://www.nasa.gov/reference/6-0-medical-operations/)).
8. **Cierre y seguimiento.** El caso pasa a seguimiento con recordatorios, y cuenta para la meta de autonomía como caso **escalado correctamente**.

**Qué ve el cirujano de vuelo**

| Bloque            | Contenido                                                                 |
| ----------------- | ------------------------------------------------------------------------- |
| Resumen SBAR      | Una tarjeta, legible en 30 s                                              |
| Línea de tiempo   | Cada evento, lectura y acción con hora y quién la hizo                    |
| Contexto          | Tendencia de 7 días, línea base, check-ins recientes, ambiente de la nave |
| Recursos a bordo  | Qué hay en el botiquín y qué ya se usó                                    |
| Estado del enlace | Cuándo se envió cada actualización y si ya llegó                          |

**Privacidad.** Los demás tripulantes ven que hay una emergencia y a quién ayudar, no los datos médicos. NASA protege la privacidad médica incluso en emergencias reales (caso Crew-8, 2024).

**Lo que no hace:** no diagnostica, no decide tratamientos y no detecta el evento por su cuenta.

### 7.6 Seguimiento

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

Navegación con barra inferior: Lunito, Mi estado, Tripulación y Botiquín. Estética: noche espacial oscura, Lunito como única ilustración, verde, ámbar y rojo solo para estados, tipografía grande (se usa flotando y con prisa). Detalle en [DISENO.md](DISENO.md).

1. **Inicio (Mi Lunito)**
   - Lunito sobre una luna, con la pancita del color de tu estado.
   - Estado en palabras y el motivo en una línea ("Revisar · sueño: dormiste menos 3 noches").
   - Botón **"Hacer mi check-in"**.
   - Botón **Emergencia** siempre visible, en todas las pantallas (ver 7.5).
2. **Check-in**
   - Lunito pregunta: "Cuéntame cómo dormiste y cómo te sientes".
   - Micrófono grande con onda animada y contador de 30 s.
   - Estado del sensor MAX30102 en vivo (segundos, pulso y SpO2).
   - Chips editables con los campos extraídos por la IA.
   - Prueba de reacción.
   - Cierre: semáforo e instrucción concreta.
3. **Mi estado (el dashboard)**
   - Lunito pequeño con el semáforo y el motivo.
   - "Qué hacer hoy": 1 a 3 acciones marcables.
   - Una tarjeta por indicador: valor, gráfica de 7 días, línea punteada de la línea base, estado en palabras y el peligro que lo afecta como etiqueta.
   - Al tocar una tarjeta: gráfica grande y explicación simple.
4. **Tripulación (la constelación)**
   - Los Lunitos de todos con nombre y estado en palabras, sin números.
   - Indicador de **autonomía** con la meta de la fase.
   - Compañero del día con su acción y el botón "Enviar ánimo".
   - Para el comandante: panel RIDGE y el balanceador ("¿Intercambiar la caminata espacial de A con B?").
5. **Botiquín**
   - Buscador de síntomas con íconos.
   - Asistente paso a paso.
   - Pestaña de inventario con barras de stock y alertas.
6. **Emergencia a bordo** (la ve el oficial médico)
   - Banner rojo con el nombre, qué pasó y la hora.
   - "Caso enviado a Tierra" con el contador del retraso.
   - Checklist del protocolo y registro del caso con hora.
   - Botón grande para dictar.
7. **Consola del cirujano de vuelo** (en Tierra, pantalla de escritorio)
   - Resumen SBAR, línea de tiempo, tendencia de 7 días, recursos a bordo y estado del enlace.
   - Caja para responder; la respuesta llega a la nave como checklist.

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
5. Emergencia simulada: un integrante "se desmaya", otro pulsa **Emergencia** y el caso llega a la vista del cirujano de vuelo con resumen SBAR, línea de tiempo y contador de retraso (**D**).

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
| 8         | Emergencia: registro del caso, resumen SBAR y vista del cirujano     |
| Extra     | Compañero del día y balanceador (pueden ir como pantallas simuladas) |

---

## Fuentes

- [NASA – The Human Body in Space](https://www.nasa.gov/humans-in-space/the-human-body-in-space/)
- [NASA Human Research Program – Five Hazards](https://www.nasa.gov/hrp/hazards)
- [NASA – Station research supporting Moon and Mars](https://nasa.gov/missions/station/iss-research/nasa-shares-station-research-today-supporting-moon-mars-tomorrow)
- [NASA NTRS – ISS research studies](https://ntrs.nasa.gov/api/citations/20170000811/downloads/20170000811.pdf)
- [npj Microgravity – Evaluación de contramedidas de ejercicio en la ISS](https://link.springer.com/10.1038/s41526-023-00256-5)
