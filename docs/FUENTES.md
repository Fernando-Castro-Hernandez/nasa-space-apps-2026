# Reglas de salud y fuentes

Toda regla de salud que use la app sale de aquí. Cada una cita su fuente o dice **pendiente de validar**. Una regla pendiente de validar puede dar amarillo, pero nunca rojo. Prototipo de hackatón, no dispositivo médico.

## 1. Método del semáforo

- **Línea base personal:** media y desviación estándar (DE) de los primeros días de cada indicador. Ventana de 7 días: **pendiente de validar** (es poca para una DE estable).
- **Amarillo por desviación:** el promedio de varios días se aleja más de 0.5 DE de la línea base, en la dirección desfavorable. Es el _smallest worthwhile change_ usado en monitoreo individual ([Plews et al. 2012](https://pubmed.ncbi.nlm.nih.gov/22367011/); revisión en Plews et al. 2013, Sports Med 43:773-781).
- **Por qué DE y no porcentaje:** un porcentaje fijo supone que todos tienen la misma variabilidad diaria. No encontramos fuente que respalde un porcentaje fijo.
- **Límite:** casi toda la evidencia viene de atletas y población general, no de astronautas.
- **Combinar indicadores** ("amarillo si 2 o más salen de rango"): decisión de diseño, **pendiente de validar**.

## 2. Reglas por indicador

| Indicador          | Amarillo                                                        | Rojo                 | Fuente                                                                                                                                                                                                            |
| ------------------ | --------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HRV (ln RMSSD)     | Media de 7 días < base − 0.5 DE                                 | Pendiente de validar | [Plews 2012](https://pubmed.ncbi.nlm.nih.gov/22367011/). Medición de 60 s válida: [Esco & Flatt 2014](https://www.jssm.org/jssm-13-535.xml-abst), [Muñoz 2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC4586373/) |
| Pulso en reposo    | Media de 3 días > base + 0.5 DE                                 | Pendiente de validar | [Radin 2020](https://www.scripps.edu/news-and-events/press-room/2020/20200116-wearable-flu.html), [Mishra 2020](https://www.nature.com/articles/s41551-020-00640-6)                                               |
| SpO2               | Caída sostenida ≥ 3 puntos vs base, o lecturas < 94 %           | Pendiente de validar | [BTS 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5531304/)                                                                                                                                                     |
| Sueño              | Media de 3 noches < 7 h **y** < base − 0.5 DE                   | Pendiente de validar | [AASM/SRS 2015](https://www.aasm.org/resources/pdf/adultsleepdurationconsensus.pdf), [Barger 2014](https://www.omicsdi.org/dataset/biostudies-literature/S-EPMC4188436)                                           |
| Prueba de reacción | Lapsos (TR > 355 ms en prueba de 3 min) > base + 0.5 DE         | Pendiente de validar | [Basner 2011](https://www.med.upenn.edu/uep/assets/user-content/documents/Basner2011-ValidityandsensitivityofabriefPVT.pdf). El umbral de 0.5 DE para PVT: pendiente de validar                                   |
| Ánimo y estrés     | Pendiente de validar                                            | Pendiente de validar | Sin punto de corte con fuente                                                                                                                                                                                     |
| CO2 de cabina      | Promedio de 1 h > 3 mmHg                                        | —                    | [OCHMO-TB-004](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-004-carbon-dioxide.pdf) (NASA-STD-3001 V2 6004)                                                                                           |
| Radiación          | Dosis acumulada cerca de 600 mSv (margen: pendiente de validar) | Llegar a 600 mSv     | [OCHMO, radiación](https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf)                                                                                                |
| Ejercicio          | Por debajo del promedio de 600 min por semana                   | —                    | [OCHMO-TB-031](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-031-exercise-overview.pdf)                                                                                                                |

**Notas sobre el sensor**

- El sueño fijo de 7 h dejaría a casi todos en amarillo: en la ISS solo 24 % de los episodios llegan a 7 h ([Barger 2014](https://www.omicsdi.org/dataset/biostudies-literature/S-EPMC4188436)). Por eso se combina con la línea base.
- SpO2: un oxímetro aprobado que marca 90 % puede corresponder a 86-94 % real, y sirve más para tendencias que para umbrales absolutos ([FDA](https://www.fda.gov/news-events/fda-brief/fda-brief-fda-warns-about-limitations-and-accuracy-pulse-oximeters)). Hay sesgo por tono de piel ([Sjoding, NEJM 2020](https://psnet.ahrq.gov/issue/racial-bias-pulse-oximetry-measurement)). El MAX30102 no está aprobado por la FDA.
- La HRV por PPG es aceptable en reposo, pero tiende a sobreestimarse y empeora con movimiento ([Schäfer & Vagedes 2013](https://pubmed.ncbi.nlm.nih.gov/22809539/)). Medir siempre en reposo, misma postura y misma hora.
- La prueba de reacción de 1 minuto no está validada; la versión breve validada (PVT-B) dura 3 minutos ([Basner 2011](https://www.med.upenn.edu/uep/assets/user-content/documents/Basner2011-ValidityandsensitivityofabriefPVT.pdf)).

## 3. Protocolo: dolor de cabeza

**Contexto:** 22 de 24 astronautas de la ISS tuvieron dolor de cabeza en vuelo; 77 % de los episodios se trató con AINE y 16 % con paracetamol, con buena eficacia en 87 % ([van Oosterhout, Neurology 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11033988/)). Para mantener el riesgo de dolor de cabeza por debajo de 1 %, el CO2 promedio de 7 días debe quedar por debajo de 2.5 mmHg ([OCHMO-TB-004](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-004-carbon-dioxide.pdf)).

**1. Preguntas de descarte.** Un "sí" a cualquiera → **rojo** (cirujano de vuelo). Banderas rojas de SNNOOP10 ([Do et al., Neurology 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6340385/)):

- ¿Empezó de golpe o es el peor dolor de tu vida?
- ¿Tienes debilidad, problemas para hablar, confusión o visión alterada?
- ¿Tienes fiebre con rigidez de cuello?
- ¿Te golpeaste la cabeza hace poco?
- ¿Empeora al toser, hacer esfuerzo o cambiar de postura?
- ¿Notaste un cambio nuevo en la visión? (también relacionado con SANS, [OCHMO-TB-004](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-004-carbon-dioxide.pdf))

**2. Contexto espacial.** La app lo revisa sola:

- CO2 de cabina > 2.5 mmHg (7 días) o > 3 mmHg (1 h): sugerir primero revisar la ventilación ([OCHMO-TB-004](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-004-carbon-dioxide.pdf)).
- Primera semana de vuelo, con náusea o congestión: probable adaptación al espacio, que afecta al 50-70 % de la tripulación ([OCHMO-TB-033](https://www.nasa.gov/wp-content/uploads/2023/07/ochmo-tb-033-spaceflight-experience-medical-care-rev-c.pdf), [van Oosterhout 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11033988/)).

**3. Verde: autocuidado.**

- Descanso, sueño e hidratación ([van Oosterhout 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11033988/)).
- Analgésico del botiquín: AINE o paracetamol ([van Oosterhout 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11033988/)). Dosis: **pendiente de validar** (la lista médica de la ISS no es pública).
- Ir a una zona mejor ventilada: **pendiente de validar**.

**4. Amarillo: oficial médico a bordo.**

- Uso repetido de analgésicos ([Do 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6340385/), abuso de analgésicos).
- Dolor de cabeza con fiebre sin otras banderas ([Do 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6340385/), bandera naranja).
- Sin alivio después del analgésico. Plazo: **pendiente de validar**.

**5. Rojo: cirujano de vuelo.** Cualquier bandera roja del paso 1. Si no hay comunicación, el oficial médico actúa sin el cirujano ([NTRS 20100016333](https://ntrs.nasa.gov/citations/20100016333)).

## 4. Autonomía y retraso

- **Meta de autonomía:** 100 % de las situaciones bien atendidas a bordo en todas las fases, ya sea resueltas por la tripulación o escaladas correctamente. NASA no publica una cifra; su concepto EIMO describe una autonomía progresiva ([EIMO ConOps 2024](https://ntrs.nasa.gov/api/citations/20240001402/downloads/2024_IWS_EIMO_ConOps_FINAL.pdf)). La meta es decisión del equipo.
- **Retraso Tierra–Marte:** de 4 a 24 minutos en un sentido ([NASA](https://www.nasa.gov/centers-and-facilities/goddard/space-communications-7-things-you-need-to-know/)); de 0 a 22 minutos en una misión tripulada ([ASCEND, NASA](https://ntrs.nasa.gov/api/citations/20220013418/downloads/ASCEND-Communication%20Delays%2C%20Disruptions%2C%20and%20Blackouts%20for%20Crewed%20Mars%20Missions.pdf)).

## 5. Sin verificar

- Texto completo de Plews 2012 y 2013 (la regla de 0.5 DE se confirmó en fuentes secundarias).
- Umbrales de la OMS de 94 % y 90 % en un documento primario.
- Error del MAX30102 frente a un oxímetro de referencia.
- Contenido y dosis del botiquín de la ISS.
