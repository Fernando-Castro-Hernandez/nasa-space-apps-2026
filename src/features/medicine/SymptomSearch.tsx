import { useState } from "react";
import {
  Bone,
  Brain,
  ChevronRight,
  Eye,
  type LucideIcon,
  Search,
  Waves,
  Wind,
  X,
} from "lucide-react";
import { t } from "@/i18n";
import { UrgentLink } from "./UrgentLink";

type SymptomId = "headache" | "nausea" | "congestion" | "back" | "eyes";

export type Symptom = {
  id: SymptomId;
  name: string;
  icon: LucideIcon;
  /** Solo lo que tiene protocolo con fuente (FUENTES.md) abre un asistente. */
  guided: boolean;
};

const symptom = (id: SymptomId, icon: LucideIcon, guided = false): Symptom => ({
  id,
  get name() {
    return t(`medicine.symptoms.${id}`);
  },
  icon,
  guided,
});

// Síntomas frecuentes en vuelo (SISTEMA.md §6). Solo dolor de cabeza tiene
// protocolo con fuente; el resto queda pendiente de validar, y la tarjeta lo
// dice antes de tocarla.
export const SYMPTOMS: Symptom[] = [
  symptom("headache", Brain, true),
  symptom("nausea", Waves),
  symptom("congestion", Wind),
  symptom("back", Bone),
  symptom("eyes", Eye),
];

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

type Props = { onPick: (s: Symptom) => void };

export function SymptomSearch({ onPick }: Props) {
  const [q, setQ] = useState("");
  const shown = SYMPTOMS.filter((s) =>
    normalize(s.name).includes(normalize(q.trim())),
  );

  return (
    <div className="medicine-search">
      <div className="medicine-search-field">
        <label htmlFor="symptom-search" className="sr-only">
          {t("medicine.search.label")}
        </label>
        <Search aria-hidden="true" />
        <input
          id="symptom-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("medicine.search.placeholder")}
          autoComplete="off"
        />
        {q && (
          <button
            type="button"
            className="medicine-search-clear"
            aria-label={t("medicine.search.clear")}
            onClick={() => setQ("")}
          >
            <X aria-hidden="true" />
          </button>
        )}
      </div>
      {shown.length > 0 ? (
        <ul className="medicine-symptoms">
          {shown.map((s) => (
            <li key={s.id} data-guided={s.guided || undefined}>
              <button
                type="button"
                data-symptom={s.id}
                onClick={() => onPick(s)}
              >
                <s.icon className="medicine-symptom-icon" aria-hidden="true" />
                <span className="medicine-symptom-text">
                  <strong>{s.name}</strong>
                  <small>
                    {s.guided
                      ? t("medicine.search.guided")
                      : t("medicine.search.noProtocol")}
                  </small>
                </span>
                {s.guided && (
                  <ChevronRight
                    className="medicine-symptom-go"
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="medicine-empty">
          <p>{t("medicine.search.empty")}</p>
          <div className="medicine-exits">
            <button
              type="button"
              className="medicine-secondary"
              onClick={() => setQ("")}
            >
              {t("medicine.search.clear")}
            </button>
            <UrgentLink />
          </div>
        </div>
      )}
    </div>
  );
}
