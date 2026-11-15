// Color y palabra de cada estado. Siempre van juntos (regla 3 de Lunito).
// Nombres y colores según DISENO.md (decisión del 2026-11-15, PR #22): Bien en
// cian, el color natural de la pancita; el verde ya no se usa para estados.
// Las claves internas (verde, ambar, rojo) se mantienen.
// Sin dependencias: lo usa la interfaz sin cargar three.js.
import type { Status } from "@/domain/vitals";

/** Colores vivos para la pancita de Lunito, puntos y gráficas (no para texto
 *  chico: el cian de la referencia tiene contraste 2.2:1 sobre blanco). */
export const STATUS_COLOR: Record<Status, string> = {
  verde: "#10C0E4",
  ambar: "#E0962A",
  rojo: "#E04545",
};

/** Tokens del tema para texto: contraste de al menos 4.5:1 sobre blanco. */
export const STATUS_TOKEN: Record<Status, string> = {
  verde: "var(--status-ok)",
  ambar: "var(--status-warn)",
  rojo: "var(--status-alert)",
};

/** Grados que gira el tono de la pancita (cian, ~185°) para llegar al color
 *  de cada estado. Ajustados a ojo sobre la textura real: la rotación no es
 *  perceptual, así que no coinciden con la resta exacta de matices. */
export const BELLY_HUE_SHIFT: Record<Status, number> = {
  verde: 0, // la pancita ya es cian: no se gira
  ambar: -168,
  rojo: 160,
};

export const STATUS_LABEL: Record<Status, string> = {
  verde: "Bien",
  ambar: "Precaución",
  rojo: "Atención",
};
