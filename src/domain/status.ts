// Color y palabra de cada estado. Siempre van juntos (regla 3 de Lunito).
// Sin dependencias: lo usa la interfaz sin cargar three.js.
import type { Status } from "@/domain/vitals";

/** Colores vivos para la pancita de Lunito y los puntos de los datos. */
export const STATUS_COLOR: Record<Status, string> = {
  verde: "#22B573",
  ambar: "#E0962A",
  rojo: "#E04545",
};

/** Tokens del tema para texto: contrastan sobre fondo claro. */
export const STATUS_TOKEN: Record<Status, string> = {
  verde: "var(--status-ok)",
  ambar: "var(--status-warn)",
  rojo: "var(--status-alert)",
};

/** Grados que gira el tono de la pancita (cian, ~185°) para llegar al color
 *  de cada estado. Ajustados a ojo sobre la textura real: la rotación no es
 *  perceptual, así que no coinciden con la resta exacta de matices. */
export const BELLY_HUE_SHIFT: Record<Status, number> = {
  verde: -40,
  ambar: -168,
  rojo: 160,
};

export const STATUS_LABEL: Record<Status, string> = {
  verde: "Todo en orden",
  ambar: "Revisar",
  rojo: "Atención",
};
