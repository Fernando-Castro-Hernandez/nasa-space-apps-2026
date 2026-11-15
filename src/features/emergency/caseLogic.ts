// Lógica pura del caso de emergencia (SISTEMA.md §7.5): abrir, registrar cada
// acción con hora, indicaciones de Tierra y cerrar. Sin estado ni efectos.

export type EventKind =
  "open" | "step" | "note" | "vitals" | "ground" | "close";

export type CaseEvent = {
  id: string;
  at: number;
  kind: EventKind;
  text: string;
};

export type GroundOrder = {
  id: string;
  text: string;
  sentAt: number;
  doneAt?: number;
};

export type EmergencyCase = {
  id: string;
  personId: string;
  what: string;
  openedAt: number;
  /** Pasos del protocolo marcados: id del paso → hora. */
  steps: Record<string, number>;
  events: CaseEvent[];
  orders: GroundOrder[];
  closedAt?: number;
};

export type ProtocolStep = { id: string; text: string; vitals?: boolean };

/** Protocolo de ejemplo: los pasos clínicos reales están pendientes de validar
 *  (la checklist médica de la ISS no es pública, SISTEMA.md §7.5). */
export const PROTOCOL: ProtocolStep[] = [
  { id: "restrain", text: "Sujetar a la persona y sujetarte tú" },
  { id: "responsive", text: "¿Responde? ¿Respira?" },
  { id: "sensor", text: "Pon el sensor en su dedo", vitals: true },
  { id: "oxygen", text: "Revisar oxígeno del botiquín" },
];

export const WHAT_HAPPENED = [
  "Se desmayó",
  "Dolor en el pecho",
  "Dificultad para respirar",
  "Golpe fuerte",
  "Otro",
];

/** Lectura simulada del sensor de prototipo para la demo. */
export const SENSOR_SAMPLE = { bpm: 58, spo2: 97 };

/** Notas dictadas simuladas, en orden, para la demo. */
export const DICTATION_SAMPLES = [
  "Abrió los ojos, responde lento",
  "Dice que se mareó antes de caer",
  "Respira normal, color de piel normal",
];

const eventId = (c: EmergencyCase) => `e${c.events.length + 1}`;

const withEvent = (
  c: EmergencyCase,
  at: number,
  kind: EventKind,
  text: string,
): EmergencyCase => ({
  ...c,
  events: [...c.events, { id: eventId(c), at, kind, text }],
});

export function openCase(
  personId: string,
  personName: string,
  what: string,
  now: number,
): EmergencyCase {
  const base: EmergencyCase = {
    id: `caso-${now}`,
    personId,
    what,
    openedAt: now,
    steps: {},
    events: [],
    orders: [],
  };
  return withEvent(base, now, "open", `Caso abierto: ${personName} · ${what}`);
}

export function checkStep(
  c: EmergencyCase,
  stepId: string,
  now: number,
): EmergencyCase {
  const step = PROTOCOL.find((s) => s.id === stepId);
  if (!step || c.steps[stepId] !== undefined) return c;
  let next = withEvent(c, now, "step", step.text);
  next = { ...next, steps: { ...next.steps, [stepId]: now } };
  if (step.vitals) {
    const { bpm, spo2 } = SENSOR_SAMPLE;
    next = withEvent(
      next,
      now,
      "vitals",
      `Signos con sensor: ${bpm} lpm, ${spo2} % SpO2`,
    );
  }
  return next;
}

export function addNote(c: EmergencyCase, now: number): EmergencyCase {
  const notes = c.events.filter((e) => e.kind === "note").length;
  const text = DICTATION_SAMPLES[notes % DICTATION_SAMPLES.length]!;
  return withEvent(c, now, "note", `“${text}”`);
}

export function addOrder(
  c: EmergencyCase,
  text: string,
  now: number,
): EmergencyCase {
  const clean = text.trim();
  if (!clean) return c;
  const order = { id: `o${c.orders.length + 1}`, text: clean, sentAt: now };
  return withEvent(
    { ...c, orders: [...c.orders, order] },
    now,
    "ground",
    `Indicación de Tierra: ${clean}`,
  );
}

export function checkOrder(
  c: EmergencyCase,
  orderId: string,
  now: number,
): EmergencyCase {
  const order = c.orders.find((o) => o.id === orderId);
  if (!order || order.doneAt !== undefined) return c;
  const orders = c.orders.map((o) =>
    o.id === orderId ? { ...o, doneAt: now } : o,
  );
  return withEvent({ ...c, orders }, now, "step", `Hecho: ${order.text}`);
}

export function closeCase(c: EmergencyCase, now: number): EmergencyCase {
  if (c.closedAt !== undefined) return c;
  return { ...withEvent(c, now, "close", "Caso cerrado"), closedAt: now };
}

/** Última lectura registrada en el caso, si existe. */
export const latestVitals = (c: EmergencyCase) =>
  c.events.toReversed().find((e) => e.kind === "vitals");
