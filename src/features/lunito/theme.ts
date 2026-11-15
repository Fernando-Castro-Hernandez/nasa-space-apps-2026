// Colores e ilustraciones de estado del dashboard de Inicio (DISENO.md, referencias
// finales): Bien en cian, Precaución en amarillo, Atención en rojo.
// ponytail: los colores viven aquí, en variables del dashboard, hasta que Ariff
// pase el cian a `--status-ok` en index.css y se pueda borrar este archivo.
import type { CSSProperties } from "react";
import type { Status } from "@/domain/vitals";
// Ilustraciones 2D de Lunito del repo, para vistas pequeñas donde no conviene un canvas 3D.
import ambar from "@/features/crew/assets/lunito-ambar.png";
import rojo from "@/features/crew/assets/lunito-rojo.png";
import verde from "@/features/crew/assets/lunito-verde.png";

export const DASH_VARS = {
  "--dash-ok": "oklch(0.72 0.12 205)",
  "--dash-warn": "oklch(0.74 0.15 85)",
  "--dash-alert": "oklch(0.65 0.19 22)",
  "--dash-ink": "oklch(0.42 0.06 295)",
  "--dash-line": "oklch(0.62 0.15 295)",
} as CSSProperties;

export const STATUS_VIEW: Record<Status, { color: string; image: string }> = {
  verde: { color: "var(--dash-ok)", image: verde },
  ambar: { color: "var(--dash-warn)", image: ambar },
  rojo: { color: "var(--dash-alert)", image: rojo },
};
