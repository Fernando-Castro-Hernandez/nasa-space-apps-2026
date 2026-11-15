// SIN USO desde el check-in único (/buenos-dias usa VoiceLogSheet): retirar
// junto con /check-in.
// Lo que se escuchó y lo que la IA entendió (HU-08 y HU-09). Todo se puede
// corregir antes de confirmar; si la IA no responde, se llena a mano.
import { Check, Sparkles } from "lucide-react";
import { LIMITS } from "@/api/contract";
import { FieldsEditor } from "./FieldsEditor";
import type { VoiceLogState } from "./useVoiceLog";

export function VoiceReview({ log }: { log: VoiceLogState }) {
  if (log.phase === "ask") return null;

  if (log.phase === "saved")
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3 shadow-sm ring-1 ring-foreground/10">
        <p className="flex items-center gap-2 font-medium">
          <Check className="size-5 text-primary" aria-hidden="true" />
          Bitácora guardada
        </p>
        <button
          type="button"
          onClick={log.write}
          className="min-h-11 rounded-full px-4 text-sm font-medium text-primary hover:bg-accent"
        >
          Corregir
        </button>
      </div>
    );

  const working = log.organizing === "working";
  const hasText = log.transcript.trim().length > 0;

  return (
    <section
      aria-label="Tu bitácora"
      className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/10"
    >
      <label className="flex flex-col gap-2">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Esto escuché · puedes corregirlo
        </span>
        <textarea
          value={log.transcript}
          onChange={(event) => log.setTranscript(event.target.value)}
          maxLength={LIMITS.textChars}
          rows={3}
          placeholder="Cuéntame cómo dormiste y cómo te sientes."
          className="w-full resize-y rounded-xl border bg-background px-3 py-2 text-base outline-none focus-visible:border-primary"
        />
      </label>

      {(log.stale || log.organizing === "failed") && hasText && (
        <button
          type="button"
          onClick={log.organize}
          disabled={working}
          className="flex min-h-11 items-center gap-2 self-start rounded-full border px-4 text-sm font-medium hover:border-primary disabled:opacity-40"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          Ordenar mi bitácora
        </button>
      )}

      <div className="flex flex-col gap-3">
        <span
          className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
          aria-live="polite"
        >
          {working
            ? "Ordenando lo que dijiste…"
            : "Lo que entendí · toca para corregir"}
        </span>
        {log.organizing === "failed" && (
          <output className="text-sm">
            No pude ordenar tu bitácora. Llena los campos a mano.
          </output>
        )}
        <FieldsEditor
          fields={log.fields}
          onChange={log.setFields}
          disabled={working}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={log.confirm}
          disabled={!log.complete || working}
          className="h-12 rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/85 disabled:opacity-40"
        >
          Confirmar bitácora
        </button>
        {!log.complete && !working && (
          <span className="text-sm text-muted-foreground">
            Elige tu ánimo y tu estrés para confirmar.
          </span>
        )}
      </div>
    </section>
  );
}
