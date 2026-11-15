// Reglas que convierten una lectura en el estado de cada indicador y en los
// parámetros de animación de Lunito. Es una función pura: aquí viven las
// reglas, la IA nunca decide esto. Fuentes en docs/FUENTES.md.

export type Status = "verde" | "ambar" | "rojo";

export type Reading = {
  bpm: number;
  spo2: number;
  /** HRV como RMSSD en ms. */
  hrv: number;
  /** Un rojo por SpO2 o pulso exige dos lecturas seguidas (FUENTES.md). */
  confirmed?: boolean;
};

export type Baseline = {
  bpm: { mean: number; sd: number };
  hrv: { mean: number; sd: number };
  spo2: { mean: number };
};

export type Indicator = { status: Status; reason: string };

export type Vitals = {
  heart: Indicator;
  oxygen: Indicator;
  recovery: Indicator;
  overall: Status;
};

// Umbrales con fuente (docs/FUENTES.md): NEWS2 para rojos, BTS 2017 para
// SpO2 < 94 %, regla de 0.5 DE de Plews para la línea base personal.
const RULES = {
  bpmRedHigh: 131,
  bpmRedLow: 40,
  spo2Red: 91,
  spo2Yellow: 94,
  spo2DropYellow: 3,
  sdFactor: 0.5,
} as const;

const worst = (...s: Status[]): Status =>
  s.includes("rojo") ? "rojo" : s.includes("ambar") ? "ambar" : "verde";

export function assessVitals(r: Reading, b: Baseline): Vitals {
  const heart = assessHeart(r, b);
  const oxygen = assessOxygen(r, b);
  const recovery = assessRecovery(r, b);
  return {
    heart,
    oxygen,
    recovery,
    overall: worst(heart.status, oxygen.status, recovery.status),
  };
}

function assessHeart(r: Reading, b: Baseline): Indicator {
  const lowAndBelowBase =
    r.bpm <= RULES.bpmRedLow && r.bpm < b.bpm.mean - RULES.sdFactor * b.bpm.sd;
  if (r.bpm >= RULES.bpmRedHigh || lowAndBelowBase) {
    return r.confirmed
      ? { status: "rojo", reason: "fuera de rango, avisa al oficial médico" }
      : { status: "ambar", reason: "lectura dudosa, repite la medición" };
  }
  if (r.bpm > b.bpm.mean + RULES.sdFactor * b.bpm.sd)
    return { status: "ambar", reason: "sobre tu normal" };
  return { status: "verde", reason: "en tu normal" };
}

function assessOxygen(r: Reading, b: Baseline): Indicator {
  if (r.spo2 <= RULES.spo2Red) {
    return r.confirmed
      ? { status: "rojo", reason: "baja, avisa al oficial médico" }
      : { status: "ambar", reason: "lectura dudosa, repite la medición" };
  }
  if (r.spo2 < RULES.spo2Yellow || b.spo2.mean - r.spo2 >= RULES.spo2DropYellow)
    return { status: "ambar", reason: "bajo tu normal" };
  return { status: "verde", reason: "en tu normal" };
}

function assessRecovery(r: Reading, b: Baseline): Indicator {
  // Sin rojo: FUENTES.md lo marca como pendiente de validar.
  if (r.hrv < b.hrv.mean - RULES.sdFactor * b.hrv.sd)
    return { status: "ambar", reason: "bajo tu normal, descansa" };
  return { status: "verde", reason: "en tu normal" };
}
