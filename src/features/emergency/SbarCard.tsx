// Resumen SBAR en cuatro bloques, legible en 30 s (SISTEMA.md §7.5).
import { t } from "@/i18n";
import type { Sbar } from "./sbar";

const KEYS: (keyof Sbar)[] = [
  "situation",
  "background",
  "assessment",
  "request",
];

export function SbarCard({ sbar }: { sbar: Sbar }) {
  return (
    <section
      aria-label={t("ground.sbar.label")}
      className="grid grid-cols-1 gap-3 md:grid-cols-2"
    >
      {KEYS.map((key) => (
        <div
          key={key}
          className="flex flex-col gap-1.5 rounded-2xl border bg-card p-4"
        >
          <h3 className="ground-label">{t(`ground.sbar.blocks.${key}`)}</h3>
          <p className="text-base leading-relaxed">{sbar[key]}</p>
        </div>
      ))}
    </section>
  );
}
