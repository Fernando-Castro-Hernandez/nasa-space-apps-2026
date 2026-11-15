// Acciones del día (HU-14): de 1 a 3, de una lista precargada y ligada a las
// reglas. La IA no inventa acciones. Las que no tienen fuente en FUENTES.md
// se marcan "pendiente de validar".
import { bySeverity, type Finding, type Source } from "@/domain/finding";
import { SOURCES } from "@/domain/sources";

export type DayAction = {
  id: string;
  text: string;
  /** null = pendiente de validar. */
  source: Source | null;
};

type CatalogEntry = DayAction & { rules: string[] };

/** Orden = prioridad cuando dos acciones salen del mismo nivel de alerta. */
const CATALOG: CatalogEntry[] = [
  {
    id: "contact-surgeon",
    text: "Contacta al cirujano de vuelo",
    rules: ["pulse-red", "spo2-red", "radiation-limit"],
    source: SOURCES.news2Response,
  },
  {
    id: "repeat-reading",
    text: "Repite la medición: 60 s en reposo, con la mano quieta",
    rules: ["pulse-doubtful", "spo2-doubtful"],
    source: SOURCES.nhsRepeat,
  },
  {
    id: "onboard-protocol",
    text: "Sigue el protocolo a bordo mientras responde Tierra",
    rules: ["distance-waiting", "distance-nolink"],
    source: SOURCES.ntrsNoComm,
  },
  {
    id: "ventilation",
    text: "Revisa la ventilación del módulo",
    rules: ["co2-high"],
    source: SOURCES.ochmoCo2,
  },
  {
    id: "sleep",
    text: "Prioriza dormir al menos 7 h esta noche",
    rules: ["sleep-low"],
    source: SOURCES.aasm2015,
  },
  {
    id: "exercise",
    text: "Completa tu ejercicio de hoy (meta: 600 min por semana)",
    rules: ["exercise-low"],
    source: SOURCES.ochmoExercise,
  },
  {
    id: "breathing",
    text: "Respiración guiada · 5 min",
    rules: ["hrv-low", "reaction-lapses"],
    source: null,
  },
  {
    id: "rest-recheck",
    text: "Descansa y mide tu pulso mañana en reposo",
    rules: ["pulse-high", "spo2-low"],
    source: null,
  },
  {
    id: "dose-cmo",
    text: "Revisa tu dosis acumulada con el oficial médico",
    rules: ["radiation-near"],
    source: null,
  },
];

/** En verde: sin acciones de salud (HU-14). */
export const ROUTINE: DayAction = {
  id: "routine",
  text: "Sin cambios, sigue tu rutina",
  source: null,
};

export const DISCLAIMER = "Prototipo, no diagnóstico";

export const MAX_ACTIONS = 3;

export function actionsFor(findings: Finding[]): DayAction[] {
  const alerts = findings.filter((f) => f.status !== "verde").sort(bySeverity);
  const out: DayAction[] = [];
  for (const f of alerts) {
    for (const entry of CATALOG) {
      if (!entry.rules.includes(f.id) || out.some((a) => a.id === entry.id))
        continue;
      const { rules: _rules, ...action } = entry;
      out.push(action);
    }
  }
  return out.length ? out.slice(0, MAX_ACTIONS) : [ROUTINE];
}

/** Para la prueba de cobertura: cada regla que alerta tiene una acción. */
export const RULES_WITH_ACTION = CATALOG.flatMap((e) => e.rules);
