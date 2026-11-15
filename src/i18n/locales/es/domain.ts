// Textos que producen las reglas de salud (src/domain): motivos, acciones, peligros.
// Los motivos empiezan en minúscula: la pantalla los pone después del estado
// o del indicador ("Precaución · pulso: sobre tu normal").
import type { Messages } from "../../translate";
import type { domain as source } from "../en/domain";

export const domain: Messages<typeof source> = {
  reasons: {
    // Indicadores del dashboard (vitals.ts).
    outOfRangeCmo: "fuera de rango, avisa al oficial médico",
    lowCmo: "baja, avisa al oficial médico",
    doubtful: "lectura dudosa, repite la medición",
    aboveUsual: "sobre tu normal",
    belowUsual: "bajo tu normal",
    belowUsualRest: "bajo tu normal, descansa",
    usual: "en tu normal",
    // Reglas de signos vitales del semáforo (vitalRules.ts).
    insufficientBaseline: "línea base insuficiente",
    fewReadings: "pocas lecturas esta semana",
    // Los indicadores con el nombre del glosario: pulso, variabilidad
    // cardíaca (HRV), oxígeno en sangre.
    hrvLow: "variabilidad cardíaca (HRV) bajo tu normal en la media de 7 días",
    hrvOk: "variabilidad cardíaca en tu normal",
    pulseRed: "pulso de {bpm} lpm fuera de rango",
    pulseHigh: "pulso en reposo sobre tu normal en la media de 3 días",
    pulseOk: "pulso en tu normal",
    spo2Red: "oxígeno en sangre al {value} %",
    spo2Below94: "oxígeno en sangre bajo 94 %",
    spo2Drop: "oxígeno en sangre 3 puntos bajo tu normal",
    spo2Ok: "oxígeno en sangre en tu normal",
    sleepLow: "dormiste {hours} h en promedio las últimas 3 noches",
    sleepOk: "sueño en tu normal",
    reactionLapses: "más lapsos de atención que tu normal (umbral {pending})",
    reactionOk: "atención en tu normal",
    // Reglas con datos de la nave (shipRules.ts).
    co2High: "CO2 de cabina en {value} mmHg (promedio de 1 h)",
    co2Ok: "aire de cabina normal",
    radiationLimit: "dosis acumulada de {dose} mSv, en el límite de {limit}",
    radiationNear:
      "dosis acumulada cerca del límite de {limit} mSv (margen {pending})",
    radiationOk: "dosis dentro del límite",
    exerciseLow: "{minutes} de {goal} min de ejercicio esta semana",
    exerciseOk: "ejercicio al día",
    // Luz D: enlace con Tierra (distanceRule.ts).
    noLink: "sin enlace con Tierra: sigue el protocolo a bordo",
    awaitingGround: "esperando respuesta de Tierra",
    groundResponds: "Tierra responde en ~{minutes} min",
    /** Una regla sin fuente que pedía rojo baja a amarillo y lo dice. */
    unsourced: "{reason} ({pending})",
  },
  /** Motivo en una línea con la letra del peligro: "I · Aislamiento: …". */
  reasonLine: "{letter} · {hazard}: {reason}",
  // Acciones del día (HU-14), ligadas a las reglas (actions.ts).
  actions: {
    contactSurgeon: "Contacta al cirujano de vuelo",
    doseLimit: "Contacta al cirujano de vuelo: tu dosis llegó al límite",
    repeatReading: "Repite la medición: 60 s en reposo, con la mano quieta",
    onboardProtocol: "Sigue el protocolo a bordo mientras responde Tierra",
    ventilation: "Revisa la ventilación del módulo",
    sleep: "Prioriza dormir al menos 7 h esta noche",
    exercise: "Completa tu ejercicio de hoy (meta: 600 min por semana)",
    breathing: "Respiración guiada · 5 min",
    restRecheck: "Descansa y vuelve a medirte mañana en reposo",
    doseCmo: "Revisa tu dosis acumulada con el oficial médico",
    routine: "Sin cambios, sigue tu rutina",
    disclaimer: "Prototipo, no diagnóstico",
  },
  // Evento ambiental en la tripulación (environment.ts, HU-13).
  environment: {
    checkVentilation: "Revisar la ventilación del {module}",
  },
  // Etiquetas de fuentes que no son un título original (sources.ts). Los
  // títulos y autores de las citas no se traducen.
  sources: {
    news2Response: "Respuesta clínica NEWS2",
    ochmoRadiation: "OCHMO, radiación",
    nasaDelay: "NASA, comunicaciones espaciales",
  },
};
