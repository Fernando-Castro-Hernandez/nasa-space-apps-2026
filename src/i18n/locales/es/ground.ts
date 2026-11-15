// Consola del cirujano de vuelo (/tierra): pantalla de escritorio en Tierra.
import type { Messages } from "../../translate";
import type { ground as source } from "../en/ground";

export const ground: Messages<typeof source> = {
  title: "Consola médica · Tierra",
  linkActive: "Enlace activo · retraso {minutes} min por tramo",
  // El único aviso de datos simulados de la consola.
  simulated: "Datos simulados para la demo",
  back: "Volver a la nave",
  empty: {
    title: "Sin casos abiertos",
    body: "Cuando la tripulación abra una emergencia, el caso aparece aquí.",
  },
  case: {
    open: "Emergencia · abierta a las {time} (hora de la nave)",
    closed: "Caso cerrado · abierto a las {time} (hora de la nave)",
    context: "{role} · Día {day} · {phase}",
  },
  hrv: "Variabilidad cardíaca (HRV)",
  hrvChart: "Variabilidad cardíaca (HRV) · últimos 7 días",
  timeline: "Línea de tiempo",
  // Estado de cada mensaje en el enlace.
  arrival: {
    arrived: "llegó {time}",
    inTransit: "en camino · llega {time}",
  },
  resources: {
    title: "Recursos a bordo",
    oxygen: "Oxígeno",
    paracetamol: "Paracetamol 325 mg",
    ibuprofen: "Ibuprofeno 400 mg",
    aed: "Desfibrilador (AED)",
    unused: "disponible · sin usar",
    perInventory: "según inventario",
    available: "disponible",
  },
  linkStatus: {
    title: "Estado del enlace",
    sent: "Aviso enviado {sent} · llega {arrives}",
    received: "Recibidos {received} de {total}",
    receivedPending: "Recibidos {received} de {total} · {pending} en camino",
    note: "Tu respuesta llega a la nave {minutes} min después de enviarla. Si no hay enlace, el oficial médico sigue el protocolo.",
  },
  reply: {
    label: "Indicación para el oficial médico",
    placeholder: "Ej.: mantener en reposo y repetir la medición en 10 min",
    hint: "Llega a la nave como un paso de la checklist.",
    send: "Enviar a la nave",
  },
  // Resumen SBAR del caso (sbar.ts): nunca es un diagnóstico.
  sbar: {
    label: "Resumen SBAR",
    blocks: {
      situation: "S · Situación",
      background: "B · Antecedentes",
      assessment: "A · Evaluación a bordo",
      request: "R · Qué se pide",
    },
    // Una frase por cada opción de "¿Qué pasó?"; `custom`, para un caso
    // guardado con otro texto.
    situation: {
      fainted: "{name}: se desmayó a las {time}.",
      chestPain: "{name}: dolor en el pecho a las {time}.",
      breathing: "{name}: dificultad para respirar a las {time}.",
      hardHit: "{name}: golpe fuerte a las {time}.",
      other: "{name}: otra urgencia a las {time}.",
      custom: "{name}: {what} a las {time}.",
    },
    lastNote: "Última nota: {note}",
    trend: {
      below: "{label} bajo su normal los últimos días.",
      above: "{label} sobre su normal los últimos días.",
      usual: "{label} en su normal los últimos días.",
      none: "{label}: sin datos recientes.",
    },
    meds: "Sin medicamentos registrados hoy. Alergias: ninguna registrada.",
    vitals: "{time} · {bpm}\u00a0lpm, {spo2}\u00a0%\u00a0SpO2.",
    vitalsSimulated:
      "{time} · muestra simulada, sensor sin conectar: {bpm}\u00a0lpm, {spo2}\u00a0%\u00a0SpO2.",
    noVitals: "Aún sin signos registrados.",
    prototype:
      "Sensor de prototipo, no médico. El diagnóstico lo decide el cirujano.",
    requestFirst:
      "Indicación sobre reposo, uso de oxígeno y siguiente medición.",
    requestSent: "Indicaciones enviadas: {count}. Confirmar si se continúa.",
  },
};
