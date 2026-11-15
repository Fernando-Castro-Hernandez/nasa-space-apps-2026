// Piezas pequeñas compartidas por el Botiquín.
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
      aria-pressed={value === v}
      onClick={() => onChange(v)}
      className={cn(
        "h-11 min-w-20 rounded-lg border px-4 text-sm font-medium transition-colors",
        value === v
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-card hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm">{question}</p>
      <fieldset className="flex shrink-0 gap-2">
        <legend className="sr-only">{question}</legend>
        {option(true, "Sí")}
        {option(false, "No")}
      </fieldset>
    </div>
  );
}

/** Fuente citada en letra pequeña, como pide AGENTS.md. */
export function Source({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs text-muted-foreground">Fuente: {children}</span>
  );
}

/** Marca de contenido sin fuente todavía (AGENTS.md, reglas del dominio). */
export function Pending() {
  return (
    <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      pendiente de validar
    </span>
  );
}
