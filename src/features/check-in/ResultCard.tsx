// Cierre del check-in: semáforo con motivo y 1 o 2 acciones concretas.
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SAMPLE_BASELINE } from "@/data/sample";
import { STATUS_LABEL, STATUS_TOKEN } from "@/domain/status";
import { assessVitals } from "@/domain/vitals";
import { headline } from "@/features/lunito/headline";
import { FINAL_READING } from "./simulation";

// Acciones de SISTEMA.md §7.3; no son tratamientos.
const ACTIONS = {
  verde: ["Sigue con tu rutina de hoy."],
  ambar: ["Respiración guiada · 5 min", "Apaga pantallas antes de dormir"],
  rojo: ["Repite la medición y avisa al oficial médico"],
} as const;

export function ResultCard() {
  const v = assessVitals(FINAL_READING, SAMPLE_BASELINE);
  const color = STATUS_TOKEN[v.overall];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-lg">Tu resultado</CardTitle>
        <span
          className="rounded-full border px-3 py-1 text-sm font-semibold"
          style={{ color, borderColor: color }}
        >
          {STATUS_LABEL[v.overall]}
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-base">{headline(v)}</p>
        <ul className="flex flex-col gap-2">
          {ACTIONS[v.overall].map((a) => (
            <li
              key={a}
              className="flex min-h-11 items-center rounded-xl bg-muted px-4 text-sm font-medium"
            >
              {a}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <a
            href="/estado"
            className="flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/85"
          >
            Ver mi estado
          </a>
          <a
            href="/"
            className="flex h-11 items-center rounded-full px-5 text-sm font-medium text-primary hover:bg-accent"
          >
            Volver a Lunito
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          Prototipo, no es un diagnóstico.
        </p>
      </CardContent>
    </Card>
  );
}
