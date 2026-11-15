// Resumen SBAR en cuatro bloques, legible en 30 s (SISTEMA.md §7.5).
import type { Sbar } from "./sbar";

const BLOCKS: { key: keyof Sbar; label: string }[] = [
  { key: "situation", label: "S · Situación" },
  { key: "background", label: "B · Antecedentes" },
  { key: "assessment", label: "A · Evaluación a bordo" },
  { key: "request", label: "R · Qué se pide" },
];

export function SbarCard({ sbar }: { sbar: Sbar }) {
  return (
    <section
      aria-label="Resumen SBAR"
      className="grid grid-cols-1 gap-3 md:grid-cols-2"
    >
      {BLOCKS.map((b) => (
        <div
          key={b.key}
          className="flex flex-col gap-1.5 rounded-xl border bg-card p-4"
        >
          <span className="text-xs font-bold tracking-wide text-primary uppercase">
            {b.label}
          </span>
          <p className="text-[0.95rem] leading-relaxed">{sbar[b.key]}</p>
        </div>
      ))}
    </section>
  );
}
