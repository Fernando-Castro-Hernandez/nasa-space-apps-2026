// Consola del cirujano de vuelo (/tierra): pantalla de escritorio en Tierra.
export const ground = {
  title: "Ground medical console",
  linkActive: "Link active · {minutes}-min delay each way",
  // El único aviso de datos simulados de la consola.
  simulated: "Simulated data for the demo",
  back: "Back to the ship",
  empty: {
    title: "No open cases",
    body: "When the crew opens an emergency, the case shows up here.",
  },
  case: {
    open: "Emergency · opened at {time} (ship time)",
    closed: "Case closed · opened at {time} (ship time)",
    context: "{role} · Day {day} · {phase}",
  },
  hrv: "Heart rate variability (HRV)",
  hrvChart: "Heart rate variability (HRV) · last 7 days",
  timeline: "Timeline",
  // Estado de cada mensaje en el enlace.
  arrival: {
    arrived: "arrived {time}",
    inTransit: "in transit · arrives {time}",
  },
  resources: {
    title: "Onboard resources",
    oxygen: "Oxygen",
    paracetamol: "Paracetamol 325 mg",
    ibuprofen: "Ibuprofen 400 mg",
    aed: "Defibrillator (AED)",
    unused: "available · unused",
    perInventory: "per inventory",
    available: "available",
  },
  linkStatus: {
    title: "Link status",
    sent: "Alert sent {sent} · arrives {arrives}",
    received: "Received {received} of {total}",
    receivedPending: "Received {received} of {total} · {pending} in transit",
    note: "Your reply reaches the ship {minutes} min after you send it. With no link, the medical officer follows the protocol.",
  },
  reply: {
    label: "Instruction for the medical officer",
    placeholder: "E.g. keep at rest and repeat the reading in 10 min",
    hint: "It reaches the ship as a checklist step.",
    send: "Send to the ship",
  },
  // Resumen SBAR del caso (sbar.ts): nunca es un diagnóstico.
  sbar: {
    label: "SBAR summary",
    blocks: {
      situation: "S · Situation",
      background: "B · Background",
      assessment: "A · Onboard assessment",
      request: "R · Request",
    },
    // Una frase por cada opción de "¿Qué pasó?"; `custom`, para un caso
    // guardado con otro texto.
    situation: {
      fainted: "{name} fainted at {time}.",
      chestPain: "{name}: chest pain at {time}.",
      breathing: "{name}: trouble breathing at {time}.",
      hardHit: "{name}: hard blow at {time}.",
      other: "{name}: other emergency at {time}.",
      custom: "{name}: {what} at {time}.",
    },
    lastNote: "Last note: {note}",
    trend: {
      below: "{label} below their usual over the last few days.",
      above: "{label} above their usual over the last few days.",
      usual: "{label} within their usual over the last few days.",
      none: "{label}: no recent data.",
    },
    meds: "No medications logged today. Allergies: none logged.",
    // Entre el número y su unidad va un espacio duro (U+00A0): no se separan.
    vitals: "{time} · {bpm}\u00a0bpm, {spo2}%\u00a0SpO2.",
    // Sin la estación conectada el paso registra una muestra: se dice.
    vitalsSimulated:
      "{time} · simulated sample, sensor not connected: {bpm}\u00a0bpm, {spo2}%\u00a0SpO2.",
    noVitals: "No vitals logged yet.",
    prototype:
      "Prototype sensor, not a medical device. The diagnosis is the surgeon's call.",
    requestFirst: "Guidance on rest, oxygen use and the next reading.",
    requestSent: "Instructions sent: {count}. Confirm whether to continue.",
  },
};
