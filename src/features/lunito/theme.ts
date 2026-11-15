// Colores, íconos e ilustraciones de estado (DISENO.md, referencias finales):
// Bien en cian, Precaución en amarillo, Atención en rojo. El color nunca va
// solo: cada estado tiene además su palabra y su propio ícono.
import type { CSSProperties } from "react";
import {
  Check,
  OctagonAlert,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { Status } from "@/domain/vitals";
// Ilustraciones 2D de Lunito del repo, para vistas pequeñas donde no conviene un canvas 3D.
import ambar from "@/features/crew/assets/lunito-ambar.png";
import rojo from "@/features/crew/assets/lunito-rojo.png";
import verde from "@/features/crew/assets/lunito-verde.png";

export const DASH_VARS = {
  "--dash-ok": "var(--status-ok)",
  "--dash-warn": "var(--status-warn)",
  "--dash-alert": "var(--status-alert)",
  "--dash-ink": "var(--foreground)",
  "--dash-line": "var(--primary)",
} as CSSProperties;

export const STATUS_VIEW: Record<Status, { color: string; image: string }> = {
  verde: { color: "var(--dash-ok)", image: verde },
  ambar: { color: "var(--dash-warn)", image: ambar },
  rojo: { color: "var(--dash-alert)", image: rojo },
};

/** Ícono propio de cada estado, el mismo en Inicio, Mi estado y "Qué significa". */
export const STATUS_ICON: Record<Status, LucideIcon> = {
  verde: Check,
  ambar: TriangleAlert,
  rojo: OctagonAlert,
};

/** Relleno del círculo del ícono, con el ícono en blanco. Bien usa el cian de
 *  la pancita; Precaución y Atención, sus tintas (5:1 o más con el blanco). */
export const STATUS_FILL: Record<Status, string> = {
  verde: "var(--reference-ok)",
  ambar: "var(--status-warn)",
  rojo: "var(--status-alert)",
};

/** Los tres estados en orden, de Bien a Atención. */
export const STATUS_ORDER: Status[] = ["verde", "ambar", "rojo"];
