# Investigación: salud de astronautas y cómo presentar el monitor

Investigación del 14-nov-2026 para definir el producto. **No es una decisión**: es insumo para `DECISIONS.md`.

Leyenda: ✅ cifra verificada en la fuente enlazada · ⚠️ no verificada o fuente secundaria (no usar en el producto sin confirmar).

> Nota de método: la página oficial de recursos del reto (https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/) **no se pudo abrir** (error SSL). Alguien debe revisarla a mano: puede traer datasets y recursos oficiales.

---

## 1. La conclusión en una página

**El cuerpo 3D clicable no nos diferencia por sí solo**: lo sugiere el propio enunciado y ya hay al menos 10 repos de 2026 en GitHub con dashboards de vitales simulados, NEWS2, radiación vs 600 mSv, PVT, "IA predictiva", offline y "gemelo digital" (ver §5). Competir en "más vitales, más IA" es perder.

**Dónde sí hay hueco** (respaldado por lo que NASA misma dice que le falta):

1. **Del "estado del órgano" al "qué hago ahora".** NASA trata el soporte a decisiones médicas a bordo (EIMO, Medical Data Architecture) como prototipo todavía. Cada órgano debería abrir un procedimiento guiado: qué medir, con qué equipo real, cuándo repetir, cuándo escalar.
2. **El retraso de comunicación como restricción de diseño.** Marte: 4–24 min por sentido y ~2 semanas de apagón en conjunción solar. Cada recomendación dice "hazlo tú ahora" o "va en el paquete para el cirujano de vuelo, respuesta en ~X min". Ningún repo de 2026 revisado lo hace.
3. **Honestidad sobre lo que se puede medir en vuelo.** Hueso no se mide en órbita (no hay DXA); sangre casi no hay laboratorio en tiempo real. Mostrar el **hueco de medición** en el cuerpo ("esto no se puede medir aquí; esto es lo que se hace") educa y nadie lo hace.
4. **Línea base personal, no rangos poblacionales.** Para PA, FC, glucosa, temperatura y SpO₂ **no hay umbral espacial publicado**; lo correcto es desviación contra la propia línea base + guía clínica terrestre citada como tal.

**Frase del pitch:** el cuerpo 3D es la interfaz, no el producto. El producto es guía accionable, con fuentes, que funciona cuando la Tierra está a 20 minutos.

---

## 2. Qué le pasa al cuerpo, por sistema

Peligros HRP (https://www.nasa.gov/hrp/hazards): **R** radiación · **A** aislamiento · **D** distancia · **G** gravedad · **H** ambiente cerrado/hostil. Riesgos oficiales: https://humanresearchroadmap.nasa.gov/risks/ ✅

| Sistema                   | Peligros   | Efecto clave (cifra)                                                                                                                                                                                                                                                                                                                                                                                                                                                              | ¿Se mide en vuelo?                                  | Umbral                                                                                                                                   | Dato para el pitch                                                                    |
| ------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Ojos (SANS)**           | G, H       | ~70 % edema de disco óptico por OCT en misiones de 6 meses ✅ [NTRS](https://ntrs.nasa.gov/api/citations/20230002241/downloads/CRFerguson_ChorioretinalFoldsSpaceflight_ArticleFile_Revision_CLEAN.pdf); ~15–16 % con definición clínica ✅ [NTRS](https://ntrs.nasa.gov/api/citations/20230006218/downloads/Brunstetter%20-%20Crewmember%20SANS%20Overview%20-%20Export%20Control%20-FINAL%20-%2001May23.pdf)                                                                    | Sí: OCT, fondo de ojo, Amsler, agudeza, ultrasonido | Sin número público; vs línea base                                                                                                        | Principal problema médico nuevo de la era ISS; suben con gafas de varias graduaciones |
| **Cerebro / cognición**   | G, R, A, H | Cerebro se desplaza hacia arriba; ventrículos agrandados, recuperación parcial a 6–12 meses; con <3 años entre misiones no se recupera la compensación ✅ [Sci Rep 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10250370/)                                                                                                                                                                                                                                                      | Sí: Cognition (10 pruebas), RST/PVT 3 min           | Sin umbral; vs línea base                                                                                                                | El cerebro "flota" en el cráneo                                                       |
| **Cardiovascular**        | G, R, A    | ~2 L de fluido suben a cabeza/torso ✅ [NASA](https://smd-cms.nasa.gov/wp-content/uploads/2023/05/240_eab469cf7232448e0b9e847f7d21dc20_MelinMatthewM.pdf.pdf); intolerancia ortostática hasta 83 % tras misiones largas ✅ [NTRS](https://ntrs.nasa.gov/api/citations/20150007319/downloads/20150007319.pdf); **trombosis yugular**: 6/11 flujo estancado/retrógrado, 1 trombo asintomático ✅ [JAMA Netw Open 2019](https://scholarlycommons.henryford.com/surgery_articles/390) | Sí: PA, ECG, ultrasonido vascular autoguiado        | Sin umbral espacial; usar AHA citada                                                                                                     | Coágulo en el cuello de alguien que no sentía nada                                    |
| **Hueso**                 | G, D       | 1–1,5 %/mes de BMD ✅ [HRP Evidence](https://ntrs.nasa.gov/api/citations/20170004597/downloads/20170004597.pdf); 9/17 no recuperan tibia al año ✅ [Sci Rep 2022](https://doaj.org/article/66f343f830484db896f2ef767ece0c1a); ARED + alendronato previno casi toda la pérdida ✅ [PubMed](https://pubmed.ncbi.nlm.nih.gov/23334732/)                                                                                                                                              | **No** (sin DXA); solo marcadores en orina          | NASA-STD-3001 T-score ⚠️ [TB-030](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-030-bone-loss.pdf)                            | 6 meses ≈ una década de pérdida por edad                                              |
| **Músculo / aeróbico**    | G          | Pantorrilla −13 %, potencia −32 % ✅ [Trappe 2009](https://epublications.marquette.edu/bio_fac/24/); VO₂pico −17 % día 15 ✅ [Moore 2014](https://phys.org/news/2014-09-intense-space-flights-astronauts-aerobic.html)                                                                                                                                                                                                                                                            | Sí: CEVIS (PFE), cargas ARED                        | **≥80 % del pre-vuelo** ✅ [TB-031](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-031-exercise-overview.pdf)                  | ~2 h de ejercicio diario obligatorio                                                  |
| **Columna**               | G          | Dolor lumbar ~43 % ✅ [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5588025); hernia 4,3× vs aviadores ✅ [PubMed](https://pubmed.ncbi.nlm.nih.gov/25893331/); estatura +5 cm ⚠️                                                                                                                                                                                                                                                                                                 | Solo dolor autorreportado                           | Sin umbral                                                                                                                               | Crecen en órbita                                                                      |
| **Riñón (cálculos)**      | G, H, D    | Sube calcio urinario, bajan volumen/pH/citrato ✅ [NAP](https://nap.nationalacademies.org/read/24953/chapter/8)                                                                                                                                                                                                                                                                                                                                                                   | Sí: volumen urinario, ultrasonido                   | Práctico: orina >2,5 L/día ✅ [NTRS](https://ntrs.nasa.gov/citations/20090019087) (no es estándar)                                       | Un cálculo puede abortar una misión; en Marte no hay evacuación                       |
| **Inmune**                | G, A, R, H | Herpesvirus en 61 % de astronautas ISS (EBV 96 %, VZV 65 %, CMV 61 %), hasta 30 días post ✅ [Front Microbiol 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6374706); 46 % tuvo evento clínico ✅ [Crucian 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC5098747)                                                                                                                                                                                                               | Investigación (saliva)                              | Sin umbral; signos: lesiones, fiebre                                                                                                     | Varicela reactivada en saliva sin síntomas                                            |
| **Piel**                  | H, A       | Exantema = categoría clínica **más reportada** en ISS (32,9 % de eventos) ✅ [Crucian 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC5098747)                                                                                                                                                                                                                                                                                                                                     | Foto con cámara                                     | Sin umbral                                                                                                                               | Encaja con "entrada por cámara" del enunciado                                         |
| **Sangre**                | G          | **54 % más destrucción de glóbulos rojos**; +30 % un año después; 5/13 anémicos al aterrizar ✅ [Nat Med 2022](https://ohri.ca/en/newsroom/being-space-destroys-more-red-blood-cells)                                                                                                                                                                                                                                                                                             | Poco: CO exhalado, muestras                         | OMS Hb <13/<12 g/dL (terrestre)                                                                                                          | "Anemia espacial" dura un año                                                         |
| **Nutrición / GI**        | D, H, G    | Pérdida de masa 2–5 % ✅ [Smith & Zwart](https://pmc.ncbi.nlm.nih.gov/articles/PMC6449861); microbioma cambia y vuelve en 6 meses (Twins)                                                                                                                                                                                                                                                                                                                                         | Peso, registro de ingesta                           | ⚠️ revisar NASA-STD-3001 Vol 1                                                                                                           | Vitaminas se degradan en misión larga ⚠️                                              |
| **Metabolismo / glucosa** | G, A       | Reposo en cama 1 semana: −29 % sensibilidad a insulina ✅ [PubMed](https://pubmed.ncbi.nlm.nih.gov/19720789/)                                                                                                                                                                                                                                                                                                                                                                     | Glucómetro; CGM probado en Ax-4                     | ADA terrestre (≥100/≥126 mg/dL)                                                                                                          | Primeras plumas de insulina en la ISS (2025)                                          |
| **Sueño / circadiano**    | A, H, D    | Se programan 8,5 h, se duermen **6,09 h**; 75 % usó hipnóticos ✅ [Lancet Neurol 2014](https://sciencedaily.com/releases/2014/08/140807215803.htm)                                                                                                                                                                                                                                                                                                                                | Actigrafía, diario, PVT                             | <6 h asociado a peor desempeño ✅ [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8919197)                                                | El sol marciano dura ~40 min más                                                      |
| **Conductual**            | A, D       | Caída de moral en el **tercer cuarto** de la misión ✅ [Stuster](https://ntrs.nasa.gov/citations/20100026549); HRP 2026 pide **monitoreo conductual semiautónomo** ✅ [NTRS](https://ntrs.nasa.gov/api/citations/20260002656/downloads/HRP%20IWS%202026%20HFBP%20Overview%20export%20control%20042026.pdf)                                                                                                                                                                        | Escalas breves, diarios, conferencias privadas      | Sin umbral; vs línea base                                                                                                                | NASA misma valida el concepto                                                         |
| **Vestibular**            | G          | Mareo espacial 60–80 % los primeros 2–3 días ✅ [NTRS](https://ntrs.nasa.gov/api/citations/19920013107/downloads/19920013107.pdf)                                                                                                                                                                                                                                                                                                                                                 | Escala de síntomas                                  | Sin umbral                                                                                                                               | Al aterrizar en Marte hay que pilotar justo cuando el oído está más desorientado      |
| **Audición**              | H          | ~72 dBA 24 h ✅ [CSA](https://www.asc-csa.gc.ca/eng/astronauts/space-medicine/noise.asp); desplazamiento en 60 % de tripulantes ✅ [NTRS](https://ntrs.nasa.gov/citations/20240009887)                                                                                                                                                                                                                                                                                            | Dosímetro, audiometría                              | ≥67 dBA → protección ⚠️ (varía 65–70)                                                                                                    | Ruido constante, día y noche                                                          |
| **Pulmón / CO₂**          | H          | Cefalea ~2× por cada +1 mmHg ✅ [Law 2014](https://sciencedaily.com/releases/2014/05/140501100922.htm)                                                                                                                                                                                                                                                                                                                                                                            | Sensores de cabina, SpO₂                            | **≤3 mmHg (1 h)** ✅ [TB-004](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-004-carbon-dioxide.pdf); polvo lunar 0,3 mg/m³ ✅ | CO₂ ~10× la Tierra                                                                    |
| **Radiación**             | R, D       | Tránsito Marte ~1,8 mSv/día, ~0,66 Sv ida y vuelta ✅ [SwRI](https://www.swri.org/press-release/swri-led-team-calculates-radiation-exposure-associated-trip-mars); ISS ⚠️ (fuentes discrepan: 0,2–1 mSv/día)                                                                                                                                                                                                                                                                      | Dosímetros, alertas de tormenta solar               | **600 mSv de carrera** ✅ [NASA](https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf)         | Ir a Marte casi agota el límite de toda una carrera                                   |
| **Dental**                | D          | Absceso dental: la condición más probable de forzar regreso ⚠️                                                                                                                                                                                                                                                                                                                                                                                                                    | Foto, dolor                                         | Sin umbral                                                                                                                               | —                                                                                     |
| **Fármacos**              | R, H, D    | 4/9 medicamentos viables 8 meses después de vencer ✅ [Wotring 2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC4706284)                                                                                                                                                                                                                                                                                                                                                            | Inventario                                          | —                                                                                                                                        | Avisar qué vence antes del fin de misión                                              |

**Mujeres vs hombres** ✅ [J Womens Health 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4236093): mujeres más intolerancia ortostática e infecciones urinarias; hombres algo más SANS y pérdida auditiva; sin diferencias conductuales. Límite de radiación igual para ambos.

**Twins Study y SOMA:** la mayoría de cambios revierten (~95 % en SOMA ⚠️ plazo), incluso tras 3 días de vuelo. Telómeros se alargan en vuelo y vuelven en ~6 meses.

### Umbrales oficiales que sí podemos usar en un semáforo

| Indicador           | Umbral               | Fuente              |
| ------------------- | -------------------- | ------------------- |
| CO₂ cabina          | ≤3 mmHg promedio 1 h | OCHMO-TB-004 ✅     |
| Radiación acumulada | ≤600 mSv carrera     | OCHMO radiación ✅  |
| Fuerza y VO₂        | ≥80 % del pre-vuelo  | OCHMO-TB-031 ✅     |
| Ruido 24 h          | ≥67 dBA → protección | NTRS 20170011521 ⚠️ |
| Polvo lunar         | 0,3 mg/m³            | LADTAG ✅           |

Todo lo demás: **línea base personal** + guía terrestre (AHA, ADA, OMS) citada como tal, o "pendiente de validar".

### ISS vs Luna vs Marte

|                  | ISS              | Luna     | Marte                                                                                                                                                                  |
| ---------------- | ---------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Comunicación     | Casi tiempo real | ~1,3 s   | **4–24 min por sentido, apagón ~2 semanas** ✅ [NTRS](https://ntrs.nasa.gov/api/citations/20240010442/downloads/Behavioral%20Challenges%20of%20a%20Mars%20Mission.pdf) |
| Evacuación       | Horas/días       | Días     | **Imposible por meses**                                                                                                                                                |
| Gravedad         | 0 g              | 0,17 g   | 0,38 g (sin datos de si protege)                                                                                                                                       |
| Reabastecimiento | Regular          | Limitado | Ninguno                                                                                                                                                                |

---

## 3. Cómo se monitorea hoy en la realidad

- **Conferencia médica privada (PMC)**: ~15 min semanales con el cirujano de vuelo. NASA-STD-3001 acepta **store-and-forward** cuando hay retraso ✅ [NASA](https://www.nasa.gov/reference/6-0-medical-operations/).
- **Crew Medical Officer (CMO)**: tripulante **no médico** con ~25–34 h de entrenamiento. Nuestro usuario real es esta persona.
- **Signos vitales**: dispositivos sueltos (no integrados). NASA prueba Tempus Pro como integrado ✅ [NASA](https://www.nasa.gov/glenn/glenn-expertise-space-exploration/human-health-performance/exploration-medical-technologies/multifunctional-integrated-medical-devices).
- **Ultrasonido guiado**: no médicos logran imágenes diagnósticas con 2–3 h de entrenamiento y guía remota (ADUM); el sucesor AMOS da instrucción a bordo sin guía ✅ [NTRS](https://ntrs.nasa.gov/api/citations/20240012964/downloads/Amos%20Paper%20with%20Figures%20and%20Legends.pdf).
- **Sangre y orina**: se congelan y bajan a Tierra (días 15, 30, 60, 120, 180). **Casi no hay laboratorio en tiempo real.**
- **Ojo**: OCT a bordo desde 2013; exámenes ~días 10, 30, 60, 90, 120.
- **Caso real**: enero 2026, **primera evacuación médica de la historia de la ISS** (Crew-11), por falta de imagen médica avanzada a bordo ✅ [Scientific American](https://www.scientificamerican.com/article/evacuated-iss-astronauts-return-to-earth-as-nasa-prepares-for-artemis-moon/). Gran gancho para el pitch.
- **Conductual**: Reaction Self Test (PVT de 3 min) desde 2009 ✅ [Spinoff](https://spinoff.nasa.gov/Spinoff2013/hm_1.html); batería Cognition (10 pruebas, ~20 min).
- **Integrated Medical Model / IMPACT**: lista oficial de 100–120 condiciones médicas para misiones ✅ [NASA](https://www.nasa.gov/nasa-integrated-medical-model-imm-overview/). Sirve como catálogo con base oficial.

**Wearables probados en el espacio:** Astroskin/Bio-Monitor (CSA, ECG, PA, SpO₂), Bio-Analyzer y rHEALTH (sangre con microlitros), Dräger Double Sensor (temperatura central), ARCHeR (actígrafo en **Artemis II**), CGM en Ax-4, Apple Watch en Inspiration4, Oura/Garmin en Fram2. Patrón: **generan datos pero nadie los integra para el astronauta a bordo**; se analizan en Tierra.

**Exploración (lo que NASA está construyendo):**

- **EIMO** (Earth-Independent Medical Operations): mover la decisión médica de Tierra a bordo ✅ [ConOps](https://ntrs.nasa.gov/api/citations/20240001402/downloads/2024_IWS_EIMO_ConOps_FINAL.pdf).
- **Medical Data Architecture**: dashboards + soporte a decisiones a bordo, todavía en test beds ✅ [NTRS](https://ntrs.nasa.gov/api/citations/20200000568/downloads/20200000568.pdf). **Es justo lo que pide el reto.**
- OCHMO-TB-017: con retraso, la automatización bien diseñada es "mission critical" ✅.

---

## 4. Datos abiertos utilizables en 48 h

| Fuente                                   | Qué tiene                                            | ¿Sirve?                                            |
| ---------------------------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| **NASA OSDR** OSD-569/575 (Inspiration4) | CBC y panel metabólico pre/durante/post de 4 civiles | **Sí**: línea base real para gráficas de tendencia |
| **OSDR RadLab**                          | Dosis de radiación medidas (MSL-RAD, etc.)           | **Sí**                                             |
| **NOAA SWPC**                            | Protones solares en tiempo real (JSON)               | **Sí**: alerta de tormenta solar real              |
| SOMA Data Portal                         | Ómica (Twins, Inspiration4)                          | Solo contexto                                      |
| LSDA / Standard Measures                 | Datos de astronautas                                 | No: acceso restringido                             |

**No existe dataset público de vitales continuos de astronautas.** Los vitales serán simulados, **calibrados con cifras publicadas** y etiquetados como simulados en la interfaz.

Usar datos reales de agencias suma en la evaluación: las diapositivas deben mostrar explícitamente qué datos/tecnología de agencias espaciales usamos.

---

## 5. Competencia y proyectos previos

**Repos de 2026 ya publicados:** AURORA (https://github.com/fabriciojunio/aurora-astronaut-health), AURA-EIMO (https://github.com/quirocode/aura-space-health-monitor, PWA offline, "bio-holograma", gemelo digital, HUD de EVA), VITA (https://github.com/Nav33dCodes/vita-astronaut-health-monitor), y otros ~7.

**Clichés ya ocupados:** dashboard de vitales simulados · NEWS2 · radiación vs 600 mSv · PVT · "IA predictiva" · offline-first · "gemelo digital" · cuerpo clicable.

**Años anteriores:** Space Biology Superhero 2022 (figura clicable para niños), Skylab 2022 (IA médica, nominado global), SpaceGenes+ 2025 (ganador global, Best Use of Science). Ningún ganador global reciente en salud de astronautas: nicho abierto.

---

## 6. Ideas de interacción más allá de "clic y tarjeta"

Costo en 48 h: **S** <6 h-persona · **M** 6–16 h · **L** >16 h.

| #   | Idea                                                                                                             | Por qué importa                                             | Costo |
| --- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----- |
| 1   | **Reloj de retraso de comunicación** + paquete store-and-forward para el cirujano                                | Diferenciador más fuerte; alineado con EIMO y NASA-STD-3001 | S     |
| 2   | **Modo apagón** (conjunción solar): la app pasa a guía 100 % autónoma                                            | Momento dramático para la demo                              | S     |
| 3   | **Hueco de medición**: órganos que no se pueden medir en vuelo se muestran distintos, con lo que sí se hace      | Honesto, educativo, nadie lo hace                           | S     |
| 4   | **Triage con "por qué"**: cada color muestra regla, umbral, fuente y tendencia                                   | Cumple la regla de fuentes de AGENTS.md; suma en Validity   | S     |
| 5   | **Tendencia vs línea base personal** (no lecturas sueltas)                                                       | Es como funciona la medicina real sin umbral espacial       | S–M   |
| 6   | **Check-in diario <2 min** (los 6 indicadores del enunciado)                                                     | El hábito que alimenta todo                                 | S     |
| 7   | **Procedimiento guiado por órgano** (qué medir, con qué equipo real, cuándo escalar)                             | El hueco que NASA reconoce (CMO no médico)                  | M     |
| 8   | **Línea de tiempo de la misión** (día 1 → 180 / tránsito): el cuerpo cambia                                      | Wow alto; requiere curvas citadas o marcadas "ilustrativas" | M     |
| 9   | **Desplazamiento de fluidos** animado (piernas → cabeza), conectado con SANS                                     | Wow muy alto                                                | M     |
| 10  | **Selector de entorno** (ISS / Orion / Luna / Marte): cambia qué se puede medir y la tasa de radiación           | Consideración explícita del enunciado                       | S–M   |
| 11  | **Calendario anclado a protocolos reales** (ojo días 10/30/60/90/120, PMC semanal)                               | Responde a "recordatorios como rutina"                      | S     |
| 12  | **Salud conductual con evidencia**: PVT 3 min + sueño (regla <6 h) + alerta del "tercer cuarto" + diario privado | Mejor que un emoji de ánimo                                 | M     |
| 13  | **Vista tripulación vs cirujano de vuelo** (misma información, dos densidades)                                   | Muestra comprensión del sistema real                        | M     |
| 14  | **Los 5 peligros sobre el cuerpo** (toggle que ilumina órganos afectados)                                        | Educativo, alineado con HRP                                 | S     |
| 15  | **Tormenta solar real** con NOAA SWPC → alerta de refugio                                                        | Dato real en vivo                                           | S     |
| 16  | **Inventario de fármacos** que avisa qué vence antes del fin de misión                                           | Riesgo HRP real, poco obvio                                 | S     |

---

## 7. El cuerpo 3D: cómo hacerlo sin que se coma el hackatón

- **Pila:** `three` + `@react-three/fiber` + `@react-three/drei` (`useGLTF`, `Bvh`, `Html`, `CameraControls`). Clic con `onClick` por malla; resaltar con `emissive` y bajar opacidad del resto ("rayos X"). Evitar postprocesado (pesa y tiene bugs).
- **Modelo:** **BodyParts3D** pasó a **CC BY 4.0** el 27-feb-2025 ✅ [DBCLS](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html); órganos ya separados en OBJ, hay que convertir a GLB. Z-Anatomy es más completo pero CC BY-SA y pesado. Revisar primero https://anatomytool.org/node/63904 (ya en GLB). Sketchfab: riesgo de mallas fusionadas o licencias NC.
- **Compresión:** `pnpm dlx @gltf-transform/cli optimize in.glb out.glb --compress meshopt`. Meta: <3–5 MB, 150–300 k triángulos. `frameloop="demand"` para ahorrar batería.
- **Accesibilidad:** lista de órganos en el DOM sincronizada con el 3D (teclado y lector de pantalla). Color nunca solo: siempre ícono + texto.
- **Regla de oro: 3 h de límite para el asset.** Si a la hora 3 no hay GLB con 8–10 órganos clicables, el MVP va con **SVG 2D por capas** y el 3D queda como meta extra. Mejor aún: **SVG como base accesible + 3D como "modo inmersivo"**.

### UX para astronautas

- Rojo = actúa ya · ámbar = atención · sin color = normal. Evitar verde masivo ("dark cockpit" ⚠️). Convención aeronáutica: [14 CFR 25.1322](https://www.law.cornell.edu/cfr/text/14/25.1322).
- Un estado global arriba, detalle bajo demanda, unidades siempre visibles, paleta segura para daltonismo (Okabe-Ito).
- Lenguaje no diagnóstico: "fuera de tu línea base: considera X", nunca "tienes Y".
- Referencia: Human Integration Design Handbook ([PDF](https://www.nasa.gov/sites/default/files/atoms/files/human_integration_design_handbook_revision_1.pdf)) — ⚠️ alguien debe leer el capítulo de displays/caution & warning y citar página.

---

## 8. Evaluación y presentación

**Criterios** (mismo peso): Impact · Creativity · Validity · Relevance · **Presentation** ✅ [guía](https://www.spaceappschallenge.org/resources/project-submission-guide/).

**Entrega** (guía 2025, ⚠️ confirmar 2026):

- Video **≤30 s** o **≤7 diapositivas** (incluye título). Pasarse = fuera del juicio global.
- **Subtítulos en inglés obligatorios**; diapositivas en inglés.
- Enlace externo público (YouTube/Drive).
- Mostrar explícitamente qué datos/tecnología de agencias espaciales se usaron.

**Historia propuesta:**

> "Día 143 del tránsito a Marte. La Tierra está a 18 minutos." La CMO hace su check-in en 90 s. El cuerpo se enciende en ámbar en ojos y cabeza: tendencia de 5 días fuera de su línea base. La app explica el porqué con fuente NASA, da la acción inmediata y empaqueta el informe para el cirujano de vuelo, que responderá en ~36 min. Cierre: el slider de la misión muestra qué pasa si no actúa.

**Guion de 30 s:** 0–3 s contexto (día 143, Tierra a 18 min) · 3–10 s check-in acelerado · 10–18 s órgano en ámbar + "por qué" + fuente · 18–25 s banner de retraso + paquete al cirujano + slider · 25–30 s "Offline · Fuentes NASA HRP · Nóstos" + URL. **Una sola historia, no un tour de funciones.** Pantalla real, subtítulos quemados.

Gancho opcional: la evacuación médica real de la ISS en enero 2026.

---

## 9. Alcance sugerido (para discutir)

**MVP:**

1. Cuerpo clicable (SVG base, 3D si llega en 3 h) con 8–10 sistemas.
2. Check-in diario <2 min, guardado en el navegador.
3. Motor de triage en funciones puras con prueba: regla + umbral + fuente + tendencia vs línea base. Sin fuente → "pendiente de validar".
4. Panel por órgano: estado, qué le hace el espacio, se puede medir o no, acción, fuente.
5. Reloj de retraso + paquete para el cirujano.
6. Datos de una astronauta ficticia en el día 143 (vitales simulados y etiquetados; sangre real de OSDR si da tiempo).
7. Funciona sin conexión.

**Extras en orden:** timeline de misión · desplazamiento de fluidos · selector de entorno · radiación con NOAA en vivo · vista del cirujano · modo apagón · Tierra vs espacio.

**Riesgos:** el asset 3D (límite de 3 h) · umbrales sin fuente (resta Validity y viola AGENTS.md) · pasarse de 30 s o no subtitular · presentarlo como diagnóstico · reglas 2026 sin confirmar.

---

## 10. Pendiente de verificar antes de usar en el producto

- Página oficial de recursos del reto (abrir a mano).
- Formato de entrega 2026, declaración de uso de IA, si se permitía preparar el repo.
- Dosis diaria en la ISS (fuentes discrepan) · T-score exacto de NASA-STD-3001 · límites de radiación de 30 días por órgano · límite de ruido (65/67/70 dBA).
- Caída de volumen plasmático · incidencia de arritmias · 48 % anémicos (Ann Intern Med 2022) · plazo de SOMA.
- Cadencias exactas de PFE, PHS y chequeos de SANS.
- Capítulo de displays del HIDH.
