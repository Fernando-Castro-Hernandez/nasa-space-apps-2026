# Reglas de salud y fuentes

Toda regla de salud que use la app sale de aquí. Cada una cita su fuente o dice **pendiente de validar**. Una regla pendiente de validar puede dar amarillo, pero nunca rojo. Prototipo de hackatón, no dispositivo médico.

## 1. Método del semáforo

- **Línea base personal:** media y desviación estándar (DE) de cada indicador, tomada **antes del vuelo**, como hace NASA (actigrafía en dos bloques de 14 días antes del vuelo, [Spaceflight Standard Measures](https://ntrs.nasa.gov/api/citations/20180002943/downloads/20180002943.pdf)).
- **Días mínimos:** 7 días para HRV y pulso (la media semanal necesita al menos 3 lecturas válidas, [Plews 2014](https://doi.org/10.1123/ijspp.2013-0455)) y 7 noches para el sueño (al menos 6 para un sueño autorreportado confiable, [Aili 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5181612)). En misiones largas, 14 días. Con menos días se muestra "línea base insuficiente" y no hay amarillo.
- **Por qué 7 y no 3:** con 7 días la DE real puede estar entre 0.64 y 2.2 veces la observada (intervalo de confianza de 95 %); con 14 días, entre 0.72 y 1.61, y con 28, entre 0.79 y 1.36 (cálculo estadístico propio, sin fuente citable). Una DE subestimada produce amarillos falsos. En la demo, la línea base previa al vuelo va simulada y etiquetada.
- **Amarillo por desviación:** el promedio de varios días se aleja más de 0.5 DE de la línea base, en la dirección desfavorable. Es el _smallest worthwhile change_ usado en monitoreo individual ([Plews et al. 2012](https://pubmed.ncbi.nlm.nih.gov/22367011/); revisión en Plews et al. 2013, Sports Med 43:773-781).
- **Por qué DE y no porcentaje:** un porcentaje fijo supone que todos tienen la misma variabilidad diaria. No encontramos fuente que respalde un porcentaje fijo.
- **Límite:** casi toda la evidencia viene de atletas y población general, no de astronautas.
- **Combinar indicadores** ("amarillo si 2 o más salen de rango"): decisión de diseño, **pendiente de validar**.

## 2. Reglas por indicador

| Indicador          | Amarillo                                                        | Rojo                                                                                                                                                        | Fuente                                                                                                                                                                                                            |
| ------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HRV (ln RMSSD)     | Media de 7 días < base − 0.5 DE                                 | Pendiente de validar                                                                                                                                        | [Plews 2012](https://pubmed.ncbi.nlm.nih.gov/22367011/). Medición de 60 s válida: [Esco & Flatt 2014](https://www.jssm.org/jssm-13-535.xml-abst), [Muñoz 2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC4586373/) |
| Pulso en reposo    | Media de 3 días > base + 0.5 DE                                 | ≥ 131 o ≤ 40 lpm en reposo, confirmado en 2 lecturas seguidas ([NEWS2](https://www.rcp.ac.uk/media/alxev00t/news2-chart-1_the-news-scoring-system_0_0.pdf)) | [Radin 2020](https://www.scripps.edu/news-and-events/press-room/2020/20200116-wearable-flu.html), [Mishra 2020](https://www.nature.com/articles/s41551-020-00640-6)                                               |
| SpO2               | Caída sostenida ≥ 3 puntos vs base, o lecturas < 94 %           | ≤ 91 %, confirmado en 2 lecturas seguidas de 60 s ([NEWS2](https://www.rcp.ac.uk/media/alxev00t/news2-chart-1_the-news-scoring-system_0_0.pdf))             | [BTS 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5531304/)                                                                                                                                                     |
| Sueño              | Media de 3 noches < 7 h **y** < base − 0.5 DE                   | Pendiente de validar                                                                                                                                        | [AASM/SRS 2015](https://www.aasm.org/resources/pdf/adultsleepdurationconsensus.pdf), [Barger 2014](https://www.omicsdi.org/dataset/biostudies-literature/S-EPMC4188436)                                           |
| Prueba de reacción | Lapsos (TR > 355 ms en prueba de 3 min) > base + 0.5 DE         | Pendiente de validar                                                                                                                                        | [Basner 2011](https://www.med.upenn.edu/uep/assets/user-content/documents/Basner2011-ValidityandsensitivityofabriefPVT.pdf). El umbral de 0.5 DE para PVT: pendiente de validar                                   |
| Ánimo y estrés     | Pendiente de validar                                            | Pendiente de validar                                                                                                                                        | Sin punto de corte con fuente                                                                                                                                                                                     |
| CO2 de cabina      | Promedio de 1 h > 3 mmHg                                        | —                                                                                                                                                           | [OCHMO-TB-004](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-004-carbon-dioxide.pdf) (NASA-STD-3001 V2 6004)                                                                                           |
| Radiación          | Dosis acumulada cerca de 600 mSv (margen: pendiente de validar) | Llegar a 600 mSv                                                                                                                                            | [OCHMO, radiación](https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf)                                                                                                |
| Ejercicio          | Por debajo del promedio de 600 min por semana                   | —                                                                                                                                                           | [OCHMO-TB-031](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-031-exercise-overview.pdf)                                                                                                                |

**Rojo por signos vitales.** En la escala NEWS2, un 3 en un solo parámetro (SpO2 ≤ 91 %, pulso ≤ 40 o ≥ 131) pide revisión médica urgente ([respuesta clínica NEWS2](https://www.rcp.ac.uk/media/mrllczrj/news2-chart-4_clinical-response-to-news-trigger-thresholds_0.pdf)). En la app eso es rojo: "Contacta al cirujano de vuelo".

- **Confirmación:** el rojo exige dos lecturas seguidas de 60 s, con la mano quieta y señal válida. Si la segunda no lo confirma, se muestra "lectura dudosa, repite" y no hay rojo. La FDA dice que la SpO2 sirve más para tendencias que para umbrales absolutos ([FDA](https://public4.pagefreezer.com/content/FDA/20-02-2024T15:13/https:/www.fda.gov/medical-devices/safety-communications/pulse-oximeter-accuracy-and-limitations-fda-safety-communication)); repetir la lectura antes de actuar lo recomienda el [NHS](https://www.northyorkshireccg.nhs.uk/wp-content/uploads/2020/12/Annex-3-Patient-Information-V1.1-HHR.pdf). Que sean exactamente dos lecturas: **pendiente de validar**.
- **Límites:** un pulso ≤ 40 puede ser normal en un astronauta entrenado; si da falsos rojos, se revisa contra la línea base. NEWS2 está validada a nivel del mar con 21 % de O2, no en atmósferas de exploración.

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
- Analgésico del botiquín: AINE o paracetamol ([van Oosterhout 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11033988/)). Antes de sugerirlo, la app pregunta (etiquetas de [paracetamol](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=591ee107-e953-4982-b75f-13a0afd7c4ae) e [ibuprofeno](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=260f5862-d65d-4c34-bf53-26ca30806a67) en DailyMed):
  - ¿Ya tomaste paracetamol hoy? ¿Cuánto en las últimas 24 h?
  - ¿Tienes enfermedad del hígado o del riñón, presión alta, enfermedad del corazón o asma? Si sí: no ibuprofeno, avisar al oficial médico.
  - ¿Has tenido úlcera, sangrado del estómago o sangre en las heces? Si sí: no ibuprofeno.
  - ¿Comiste? El ibuprofeno se toma con comida.
- Dosis del botiquín de la ISS ([NASA, Medical Kit 3.001, 2015](https://www.nasa.gov/wp-content/uploads/2015/03/medical_kit_checklist_-_full_release.pdf)):
  - **Paracetamol 325 mg:** no más de 12 tabletas en 24 h.
  - **Ibuprofeno 400 mg:** con comida, no más de 8 tabletas en 24 h.
  - La lista no da dosis por toma ni intervalo. Como referencia de venta libre en Tierra: paracetamol 500 mg, 2 tabletas cada 6 h, máximo 6 en 24 h; ibuprofeno 200 mg, 1 o 2 tabletas cada 4 a 6 h, máximo 6 en 24 h (DailyMed, enlaces arriba). La app muestra la referencia de venta libre, que es la más conservadora.
- Si hay dolor de costado, antecedente de cálculos renales o deshidratación, preferir paracetamol: **pendiente de validar** (no encontramos fuente de NASA que relacione AINE y cálculos en vuelo).
- Ir a una zona mejor ventilada: **pendiente de validar**.

**4. Amarillo: oficial médico a bordo.**

- Analgésicos 15 días o más en el mes: riesgo de dolor de cabeza por abuso de analgésicos ([ICHD-3 8.2.3](https://www.ichd-3.org/8-headache-attributed-to-a-substance-or-its-withdrawal/8-2-medication-overuse-headache-moh/8-2-3-simple-analgesic-overuse-headache); [Do 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6340385/)).
- Dolor de cabeza con fiebre sin otras banderas ([Do 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6340385/), bandera naranja).
- El dolor empeora o dura más de 10 días (etiquetas de DailyMed, enlaces arriba).

**5. Rojo: cirujano de vuelo.** Cualquier bandera roja del paso 1. Si no hay comunicación, el oficial médico actúa sin el cirujano ([NTRS 20100016333](https://ntrs.nasa.gov/citations/20100016333)).

## 4. Autonomía y retraso

- **Meta de autonomía:** 100 % de las situaciones bien atendidas a bordo en todas las fases, ya sea resueltas por la tripulación o escaladas correctamente. NASA no publica una cifra; su concepto EIMO describe una autonomía progresiva ([EIMO ConOps 2024](https://ntrs.nasa.gov/api/citations/20240001402/downloads/2024_IWS_EIMO_ConOps_FINAL.pdf)). La meta es decisión del equipo.
- **Retraso Tierra–Marte:** de 4 a 24 minutos en un sentido ([NASA](https://www.nasa.gov/centers-and-facilities/goddard/space-communications-7-things-you-need-to-know/)); de 0 a 22 minutos en una misión tripulada ([ASCEND, NASA](https://ntrs.nasa.gov/api/citations/20220013418/downloads/ASCEND-Communication%20Delays%2C%20Disruptions%2C%20and%20Blackouts%20for%20Crewed%20Mars%20Missions.pdf)).

## 5. Sin verificar

- Texto completo de Plews 2012 y 2013 (la regla de 0.5 DE se confirmó en fuentes secundarias).
- Umbrales de la OMS de 94 % y 90 % en un documento primario.
- Error del MAX30102 frente a un oxímetro de referencia.
- Si la lista del botiquín de la ISS de 2015 sigue vigente, y la dosis por toma que usa NASA en vuelo.
- Cuántos días hacen falta para estimar la DE de ln RMSSD (no hay fuente específica).
