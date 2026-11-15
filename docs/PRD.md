# PRD: monitoreo de salud de la tripulación

Documento de requisitos del producto. Sale de [SISTEMA.md](SISTEMA.md) (la lluvia de ideas) y se detalla en [HISTORIAS.md](HISTORIAS.md) (historias de usuario). Las reglas de salud y sus fuentes están en [FUENTES.md](FUENTES.md). Si este documento y `SISTEMA.md` se contradicen, manda este y se corrige el otro en el mismo PR.

> Prototipo de hackatón, no dispositivo médico. Nada en la app se presenta como diagnóstico.

## 1. Problema

En una misión larga la tripulación ya genera muchos datos de salud (dosímetros, equipos de ejercicio, soporte de vida), pero viven en sistemas separados y se analizan en Tierra. Al astronauta a bordo nadie le junta esos datos con lo que siente, ni le dice qué hacer. Entre más lejos de la Tierra, más tarda la ayuda: entre la Tierra y Marte un mensaje tarda de 4 a 24 minutos ([NASA](https://www.nasa.gov/centers-and-facilities/goddard/space-communications-7-things-you-need-to-know/)).

## 2. Objetivo

Que la tripulación pueda **actuar por sí misma ante cualquier situación de salud**, en un ciclo **Registrar → Interpretar → Actuar → Dar seguimiento**, con los datos ordenados por los 5 peligros de NASA (RIDGE: Radiación, aIslamiento, Distancia, Gravedad, ambiEnte).

Es la dirección que NASA describe como Earth Independent Medical Operations: pasar la atención médica de la Tierra a la nave, porque en Marte no habrá comunicación en tiempo real ni evacuación de emergencia ([EIMO ConOps, NASA HRP 2024](https://ntrs.nasa.gov/api/citations/20240001402/downloads/2024_IWS_EIMO_ConOps_FINAL.pdf)).

**Pitch:** no reinventamos los sensores de la nave; los conectamos con lo que la tripulación siente y mide, y lo convertimos en acciones.

## 3. Usuarios

| Rol                    | Qué necesita                                                                 |
| ---------------------- | ---------------------------------------------------------------------------- |
| Astronauta             | Check-in rápido, saber su estado mediante Lunito y qué hacer hoy.            |
| Oficial médico a bordo | Atender casos amarillos y emergencias aunque no haya comunicación.           |
| Comandante             | Aprobar o rechazar cambios de tareas propuestos por el balanceador.          |
| Cirujano de vuelo      | Recibir un caso en SBAR, revisar su evolución y responder. Simulado en demo. |
| Presentador de la demo | Disparar eventos simulados y mostrar el sistema sin depender del azar.       |

## 4. Alcance del MVP

### Dentro

1. Estación de check-in: ESP32 + MAX30102 enviando pulso, SpO2 e intervalos entre latidos a la app por Bluetooth.
2. Perfiles tipo Netflix: cada tripulante entra a su perfil desde cualquier dispositivo y todos ven los mismos datos.
3. Bitácora por voz de 30 s convertida en campos editables.
4. Línea base personal, clasificación por peligro y semáforo con motivo.
5. Feed de la nave simulado (dosímetro, ejercicio, ambiente) e historial de días previos simulado.
6. Mi Lunito con semáforo, motivo, acciones y acceso al check-in; Constelación con el estado general de la tripulación, autonomía y panel RIDGE para el comandante.
7. Respiración guiada con pulso en vivo.
8. Un flujo completo del botiquín: dolor de cabeza.
9. Emergencia completa: disparo manual, aviso inmediato, registro del CMO, resumen SBAR, contador de retraso y consola simulada del cirujano de vuelo.

### Si sobra tiempo

Prueba de reacción, compañero del día, balanceador de carga, notificaciones proactivas, reportes diario y semanal, PIN por perfil, alerta de tormenta solar con datos reales de NOAA SWPC.

### Fuera

- Modelo 3D del cuerpo humano.
- "Doctor IA": la IA transcribe, estructura, resume y guía protocolos ya cargados. No diagnostica ni inventa tratamientos.
- Rankings o competencia entre tripulantes.
- Dashboard genérico de gráficas sin acción asociada.
- Temperatura corporal: el sensor de temperatura del MAX30102 mide el chip, no el cuerpo.
- Cuentas con contraseña. El backend se limita a un Worker de Cloudflare.

## 5. Métricas de éxito (para el hackatón)

- La demo en vivo de [SISTEMA.md §11](SISTEMA.md) corre completa en menos de 3 minutos, con sensor real o con una sesión grabada.
- Cada color del semáforo muestra motivo, peligro y la fuente de la regla, o la etiqueta "pendiente de validar".
- Todo dato simulado aparece etiquetado como simulado en la interfaz.
- Cumple los cinco criterios del jurado: Impact, Creativity, Validity, Relevance y Presentation.

## 6. Requisitos funcionales

Cada requisito se detalla como historia en [HISTORIAS.md](HISTORIAS.md).

| Módulo         | Requisito                                                               | Historias            |
| -------------- | ----------------------------------------------------------------------- | -------------------- |
| Base           | Perfiles, datos compartidos entre dispositivos y datos simulados.       | HU-01, HU-02, HU-29  |
| Sensor         | Lectura del MAX30102, envío a la app, control de calidad y grabación.   | HU-03 a HU-07        |
| Check-in       | Bitácora por voz, extracción de campos y prueba de reacción.            | HU-08 a HU-10        |
| Interpretación | Línea base, semáforo por peligro, cruce de datos e instrucción del día. | HU-11 a HU-14        |
| Pantallas      | Mi Lunito, Mi estado, autonomía y Constelación.                         | HU-15 a HU-17, HU-30 |
| Acciones       | Respiración guiada, botiquín e inventario.                              | HU-18 a HU-20        |
| Escalamiento   | Emergencia a bordo, SBAR, modo retraso y consola de Tierra.             | HU-21 a HU-23        |
| Seguimiento    | Notificaciones y reporte diario.                                        | HU-24, HU-25         |
| Trabajo en eq. | Compañero del día y balanceador de carga.                               | HU-26, HU-27         |
| Demo           | Panel para disparar eventos simulados.                                  | HU-28                |

## 7. Requisitos no funcionales

- **Seguridad del mensaje:** aviso visible de "prototipo, no diagnóstico" en el check-in y en Mi estado. La IA solo entiende y redacta lenguaje; funciones puras con reglas citadas deciden color, alertas y escalamiento. La IA nunca recomienda medicamentos fuera del protocolo cargado.
- **Fuentes:** todo umbral o recomendación de salud lleva fuente citada (NASA HRP, OCHMO, otra agencia o fuente médica reconocida). Sin fuente se muestra "pendiente de validar" y no puede encender rojo por sí solo.
- **Privacidad:** la Constelación y el compañero del día nunca muestran cifras ni motivos médicos. En una emergencia, la tripulación solo ve a quién ayudar; el CMO y el cirujano ven el caso. Los perfiles no tienen contraseña, como en Netflix; en la presentación se aclara que una misión real necesitaría control de acceso. El audio de la bitácora no sale de Cloudflare.
- **Legibilidad:** sigue [DISENO.md](DISENO.md): noche espacial, Lunito como única ilustración, texto de lectura de 15 px o más, botones de 44 px o más y color nunca como única señal. En emergencia desaparecen el contenido lúdico y las animaciones decorativas.
- **Accesibilidad:** contraste AA (WCAG 2.2) en textos y semáforo.
- **Resiliencia de la demo:** la app funciona sin el sensor reproduciendo sesiones grabadas. Si se pierde la comunicación con Tierra, el caso continúa a bordo y se envía al volver el enlace. Para sincronizar dispositivos e IA se lleva un hotspot propio.
- **Plataforma:** PWA instalable. Web Bluetooth funciona en Chrome de escritorio y Android, no en iOS; la demo se hace en esos navegadores.
- **Costo:** todo cabe en planes gratuitos.
- **Pruebas:** la lógica de interpretación (línea base, HRV, semáforo, cruce, autonomía) va en funciones puras con pruebas en Vitest.

## 8. Reglas de salud

Las reglas completas, con cita, están en [FUENTES.md](FUENTES.md). En resumen:

- **Amarillo por desviación personal:** un indicador pasa a amarillo cuando su promedio de varios días se aleja más de 0.5 desviaciones estándar de la línea base personal (método _smallest worthwhile change_). Se usa desviación estándar y no un porcentaje fijo porque cada persona tiene distinta variabilidad diaria; no encontramos fuente que respalde un porcentaje fijo.
- **Umbrales absolutos con fuente:** CO2 de cabina ≤ 3 mmHg (1 h), radiación ≤ 600 mSv en la carrera, SpO2 < 94 % o caída de 3 puntos.
- **Rojo:** solo por una bandera roja con fuente (por ejemplo, las del protocolo de dolor de cabeza) o porque el oficial médico lo marca. Del sensor, solo SpO2 ≤ 91 %, pulso ≥ 131 lpm, o pulso ≤ 40 lpm cuando además está por debajo de su línea base (escala NEWS2), confirmados en dos lecturas seguidas.
- **Línea base:** 7 días previos al vuelo como mínimo (14 en misiones largas); con menos no hay amarillo.
- **Botiquín:** dosis máximas del botiquín de la ISS publicado por NASA, con la referencia de venta libre como dosis por toma.

## 9. Decisiones técnicas

| Tema                     | Decisión                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Conexión con la estación | Bluetooth (Web Bluetooth).                                                                                    |
| Datos compartidos        | Cloudflare D1 dentro del mismo Worker que sirve la app. Las pantallas consultan cada pocos segundos.          |
| Transcripción            | Workers AI con `whisper-large-v3-turbo`. Respaldo: Web Speech API de Chrome (envía el audio a Google).        |
| Extracción de campos     | Workers AI con `llama-3.3-70b-instruct-fp8-fast` en modo JSON; se valida la respuesta y se reintenta una vez. |
| Llaves de API            | Ninguna: Workers AI y D1 se usan con _bindings_ del Worker.                                                   |

El plan gratuito de Workers AI da 10,000 neurons al día; cada check-in (transcripción + extracción) gasta unas 50, así que caben unos 200 check-ins al día ([precios](https://developers.cloudflare.com/workers-ai/platform/pricing/)).

## 10. Supuestos

- Hay una sola estación con sensor; se conecta por Bluetooth al dispositivo de quien hace su check-in.
- El historial previo a la demo es simulado, calibrado con cifras publicadas y etiquetado.
- El MAX30102 es el único sensor real.

## 11. Riesgos

| Riesgo                                               | Mitigación                                                      |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| El sensor falla en el escenario (movimiento, luz)    | Grabación y reproducción de sesiones (HU-05).                   |
| Lecturas de SpO2 sesgadas por tono de piel           | Declararlo en la interfaz y en la presentación.                 |
| Sin internet en el evento                            | Hotspot propio; chips editables a mano si la IA no responde.    |
| Workers AI devuelve JSON inválido                    | Validar contra el esquema, reintentar una vez, llenar a mano.   |
| Se pierde el enlace durante una emergencia           | Guardar eventos localmente y reenviarlos al recuperar conexión. |
| Umbrales sin fuente restan en Validity               | Etiqueta "pendiente de validar" y [FUENTES.md](FUENTES.md).     |
| La meta de autonomía incentiva esconder casos graves | Escalar bien un caso rojo cuenta como éxito (HU-17).            |

## 12. Preguntas abiertas

Ninguna bloquea el MVP. Decidido: la lista del botiquín de la ISS de 2015 se toma como vigente y el rojo se confirma con dos lecturas. Lo que falta verificar está en [FUENTES.md §5](FUENTES.md).
