// Lógica pura del caso de emergencia (SISTEMA.md §7.5): abrir, registrar cada
// acción con hora, indicaciones de Tierra y cerrar. Sin estado ni efectos.
//
// El caso se guarda en el dispositivo y lo leen la nave y Tierra, quizá en
// otro idioma. Por eso guarda códigos y datos, no frases: "qué pasó" es un
// código (`fainted`) y cada evento lleva sus datos en `params`. Las frases se
// arman al mostrarlas (`whatLabel`, `eventText`), en el idioma activo. Lo que
// dice una persona (una nota dictada, una indicación de Tierra) se guarda tal
// cual: es una cita.
import { formatNumber, LOCALES, t } from "@/i18n";
import { translate } from "@/i18n/translate";

export type EventKind =
  "open" | "step" | "note" | "vitals" | "ground" | "close";

export type CaseEvent = {
  id: string;
  at: number;
  kind: EventKind;
  /** La frase en el idioma activo al registrarla. Para mostrarla usa
   *  `eventText`, que la arma en el idioma de ahora. */
  text: string;
  /**
   * Datos de la frase, sin idioma. Según `kind`: open `{ name, what }`;
   * step `{ step }` (paso del protocolo) o `{ done }` (indicación de Tierra
   * hecha); vitals `{ bpm, spo2 }`; note `{ said }`; ground `{ order }`.
   * Falta en los casos guardados antes. (Las notas de muestra de versiones
   * anteriores traen `{ sample }`: se leen como se guardaron.)
   */
  params?: Record<string, string | number>;
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
  /** Código de "qué pasó" (`WHAT_HAPPENED`); un caso viejo puede traer texto. */
  what: string;
  openedAt: number;
  /** Pasos del protocolo marcados: id del paso → hora. */
  steps: Record<string, number>;
  events: CaseEvent[];
  orders: GroundOrder[];
  closedAt?: number;
};

/** Opciones de "¿Qué pasó?", como códigos. */
export const WHAT_HAPPENED = [
  "fainted",
  "chestPain",
  "breathing",
  "hardHit",
  "other",
] as const;
export type WhatCode = (typeof WHAT_HAPPENED)[number];

const isWhatCode = (value: string): value is WhatCode =>
  (WHAT_HAPPENED as readonly string[]).includes(value);

/** Código de "qué pasó": acepta el código o su texto en cualquier idioma
 *  ("Se desmayó", "Fainted"). null si es otro texto. */
export function whatCode(what: string): WhatCode | null {
  if (isWhatCode(what)) return what;
  const clean = what.trim().toLocaleLowerCase();
  return (
    WHAT_HAPPENED.find((code) =>
      LOCALES.some(
        (locale) =>
          translate(locale, `emergency.what.${code}`).toLocaleLowerCase() ===
          clean,
      ),
    ) ?? null
  );
}

/** "Qué pasó" en el idioma activo; un texto que no es código va tal cual. */
export function whatLabel(what: string) {
  const code = whatCode(what);
  return code ? t(`emergency.what.${code}`) : what;
}

type StepId = "restrain" | "responsive" | "sensor" | "oxygen";
export type ProtocolStep = { id: StepId; text: string; vitals?: boolean };

const step = (id: StepId, vitals?: true): ProtocolStep => ({
  id,
  get text() {
    return t(`emergency.protocol.steps.${id}`);
  },
  ...(vitals && { vitals }),
});

/** Protocolo de ejemplo: los pasos clínicos reales están pendientes de validar
 *  (la checklist médica de la ISS no es pública, SISTEMA.md §7.5). */
export const PROTOCOL: ProtocolStep[] = [
  step("restrain"),
  step("responsive"),
  step("sensor", true),
  step("oxygen"),
];

/** Lectura simulada del sensor de prototipo para la demo. */
export const SENSOR_SAMPLE = { bpm: 58, spo2: 97 };

/** Pulso y SpO2 de un evento de signos. Un caso guardado antes de `params`
 *  solo tiene la frase: sus dos primeros números son el pulso y la SpO2. */
export function vitalsOf(e: CaseEvent) {
  const [bpm, spo2] = e.params
    ? [e.params.bpm, e.params.spo2]
    : (e.text.match(/\d+/g) ?? []);
  return bpm === undefined || spo2 === undefined
    ? null
    : { bpm: Number(bpm), spo2: Number(spo2) };
}

const asText = (value: string | number | undefined) => String(value ?? "");

/** La frase de un evento en el idioma activo. */
export function eventText(e: CaseEvent): string {
  const p = e.params;
  if (!p) return e.text;
  switch (e.kind) {
    case "open":
      return t("emergency.log.opened", {
        name: asText(p.name),
        what: whatLabel(asText(p.what)),
      });
    case "step":
      if (p.done !== undefined)
        return t("emergency.log.orderDone", { text: asText(p.done) });
      return PROTOCOL.find((s) => s.id === p.step)?.text ?? e.text;
    case "vitals": {
      const v = vitalsOf(e);
      return v
        ? t("emergency.log.vitals", {
            bpm: formatNumber(v.bpm),
            spo2: formatNumber(v.spo2),
          })
        : e.text;
    }
    case "note":
      return p.said === undefined
        ? e.text
        : t("emergency.log.note", { text: asText(p.said) });
    case "ground":
      return t("emergency.log.groundOrder", { text: asText(p.order) });
    case "close":
      return t("emergency.log.closed");
  }
}

const eventId = (c: EmergencyCase) => `e${c.events.length + 1}`;

function withEvent(
  c: EmergencyCase,
  at: number,
  kind: EventKind,
  params: Record<string, string | number> = {},
): EmergencyCase {
  const event: CaseEvent = { id: eventId(c), at, kind, text: "", params };
  return { ...c, events: [...c.events, { ...event, text: eventText(event) }] };
}

/** Un caso cerrado ya no admite registros: lo que pasó después no es de él. */
const isClosed = (c: EmergencyCase) => c.closedAt !== undefined;

/** Abre el caso. `what` es un código de `WHAT_HAPPENED` (también se acepta su
 *  texto en cualquier idioma, que se guarda como código). */
export function openCase(
  personId: string,
  personName: string,
  what: string,
  now: number,
): EmergencyCase {
  const code = whatCode(what) ?? what.trim();
  const base: EmergencyCase = {
    id: `caso-${now}`,
    personId,
    what: code,
    openedAt: now,
    steps: {},
    events: [],
    orders: [],
  };
  return withEvent(base, now, "open", { name: personName, what: code });
}

export function checkStep(
  c: EmergencyCase,
  stepId: string,
  now: number,
): EmergencyCase {
  const found = PROTOCOL.find((s) => s.id === stepId);
  if (!found || c.steps[stepId] !== undefined || isClosed(c)) return c;
  let next = withEvent(c, now, "step", { step: stepId });
  next = { ...next, steps: { ...next.steps, [stepId]: now } };
  if (found.vitals) next = withEvent(next, now, "vitals", { ...SENSOR_SAMPLE });
  return next;
}

/** Nota dictada o escrita, con hora. Es una cita de quien la dijo: una nota
 *  vacía no se registra, y el caso nunca la inventa. */
export function addNote(
  c: EmergencyCase,
  now: number,
  said: string,
): EmergencyCase {
  const clean = said.trim();
  if (!clean || isClosed(c)) return c;
  return withEvent(c, now, "note", { said: clean });
}

export function addOrder(
  c: EmergencyCase,
  text: string,
  now: number,
): EmergencyCase {
  const clean = text.trim();
  if (!clean || isClosed(c)) return c;
  const order = { id: `o${c.orders.length + 1}`, text: clean, sentAt: now };
  return withEvent({ ...c, orders: [...c.orders, order] }, now, "ground", {
    order: clean,
  });
}

export function checkOrder(
  c: EmergencyCase,
  orderId: string,
  now: number,
): EmergencyCase {
  const order = c.orders.find((o) => o.id === orderId);
  if (!order || order.doneAt !== undefined || isClosed(c)) return c;
  const orders = c.orders.map((o) =>
    o.id === orderId ? { ...o, doneAt: now } : o,
  );
  return withEvent({ ...c, orders }, now, "step", { done: order.text });
}

export function closeCase(c: EmergencyCase, now: number): EmergencyCase {
  if (isClosed(c)) return c;
  return { ...withEvent(c, now, "close"), closedAt: now };
}

/** Última lectura registrada en el caso, si existe. */
export const latestVitals = (c: EmergencyCase) =>
  c.events.toReversed().find((e) => e.kind === "vitals");
