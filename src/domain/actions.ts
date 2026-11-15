// Acciones del día (HU-14): de 1 a 3, de una lista precargada y ligada a las
// reglas. La IA no inventa acciones. Las que no tienen fuente en FUENTES.md
// se marcan "pendiente de validar".
import { bySeverity, type Finding, type Source } from "@/domain/finding";
import { SOURCES } from "@/domain/sources";
import { t, type MessageKey } from "@/i18n";

export type DayAction = {
  id: string;
  text: string;
  /** null = pendiente de validar. */
  source: Source | null;
};

/** El catálogo guarda la clave del texto: se traduce al armar la acción. */
type CatalogEntry = Omit<DayAction, "text"> & {
  key: MessageKey;
  rules: string[];
};

/** Orden = prioridad cuando dos acciones salen del mismo nivel de alerta. */
const CATALOG: CatalogEntry[] = [
  {
    id: "contact-surgeon",
    key: "domain.actions.contactSurgeon",
    rules: ["pulse-red", "spo2-red"],
    source: SOURCES.news2Response,
  },
  {
    id: "dose-limit",
    key: "domain.actions.doseLimit",
    rules: ["radiation-limit"],
    source: SOURCES.ochmoRadiation,
  },
  {
    id: "repeat-reading",
    key: "domain.actions.repeatReading",
    rules: ["pulse-doubtful", "spo2-doubtful"],
    source: SOURCES.nhsRepeat,
  },
  {
    id: "onboard-protocol",
    key: "domain.actions.onboardProtocol",
    rules: ["distance-waiting", "distance-nolink"],
    source: SOURCES.ntrsNoComm,
  },
  {
    id: "ventilation",
    key: "domain.actions.ventilation",
    rules: ["co2-high"],
    source: SOURCES.ochmoCo2,
  },
  {
    id: "sleep",
    key: "domain.actions.sleep",
    rules: ["sleep-low"],
    source: SOURCES.aasm2015,
  },
  {
    id: "exercise",
    key: "domain.actions.exercise",
    rules: ["exercise-low"],
    source: SOURCES.ochmoExercise,
  },
  {
    id: "breathing",
    key: "domain.actions.breathing",
    rules: ["hrv-low", "reaction-lapses"],
    source: null,
  },
  {
    id: "rest-recheck",
    key: "domain.actions.restRecheck",
    rules: ["pulse-high", "spo2-low"],
    source: null,
  },
  {
    id: "dose-cmo",
    key: "domain.actions.doseCmo",
    rules: ["radiation-near"],
    source: null,
  },
];

/** En verde: sin acciones de salud (HU-14). */
export const ROUTINE: DayAction = {
  id: "routine",
  get text() {
    return t("domain.actions.routine");
  },
  source: null,
};

/** Aviso en el idioma activo. Es función para que siga el cambio de idioma. */
export const DISCLAIMER = () => t("domain.actions.disclaimer");

export const MAX_ACTIONS = 3;

export function actionsFor(findings: Finding[]): DayAction[] {
  const alerts = findings.filter((f) => f.status !== "verde").sort(bySeverity);
  const out: DayAction[] = [];
  for (const f of alerts) {
    for (const entry of CATALOG) {
      if (!entry.rules.includes(f.id) || out.some((a) => a.id === entry.id))
        continue;
      out.push({ id: entry.id, text: t(entry.key), source: entry.source });
    }
  }
  return out.length ? out.slice(0, MAX_ACTIONS) : [ROUTINE];
}

/** Para la prueba de cobertura: cada regla que alerta tiene una acción. */
export const RULES_WITH_ACTION = CATALOG.flatMap((e) => e.rules);
