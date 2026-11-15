// Piezas pequeñas compartidas por el Botiquín.
import type { ReactNode } from "react";
import { t } from "@/i18n";

type YesNoProps = {
  question: string;
  value: boolean | undefined;
  onChange: (v: boolean) => void;
};

/** Pregunta de sí o no con botones grandes (se usa flotando y con prisa). */
export function YesNo({ question, value, onChange }: YesNoProps) {
  const option = (v: boolean, label: string) => (
    <button
      type="button"
      className="medicine-answer"
      aria-pressed={value === v}
      onClick={() => onChange(v)}
    >
      {label}
    </button>
  );
  return (
    <fieldset className="medicine-question" data-answered={value !== undefined}>
      <legend className="sr-only">{question}</legend>
      <p aria-hidden="true">{question}</p>
      <div className="medicine-answers">
        {option(true, t("medicine.yes"))}
        {option(false, t("medicine.no"))}
      </div>
    </fieldset>
  );
}

/** Fuente citada en letra pequeña, como pide AGENTS.md. */
export function Source({ children }: { children: ReactNode }) {
  return (
    <span className="medicine-source">
      {t("medicine.sourceLabel")} {children}
    </span>
  );
}

/** Marca de contenido sin fuente todavía (AGENTS.md, reglas del dominio). */
export function Pending() {
  return (
    <span className="medicine-pending-tag">
      {t("common.pendingValidation")}
    </span>
  );
}
