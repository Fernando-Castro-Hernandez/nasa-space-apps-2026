// Medidas del héroe "Así estás hoy", tomadas de la referencia 2 de DISENO.md:
// una para tablet y otra para celular (ahí Lunito es más grande y las burbujas
// se encima). Todo en píxeles del espacio de la referencia; el componente lo
// escala al ancho real del contenedor.
import type { IndicatorView } from "./dashboardData";

type Key = IndicatorView["key"];

export type Layout = {
  /** Ancho y alto del espacio de la referencia. */
  size: [number, number];
  lunito: { left: number; top: number; width: number };
  /** Centro y diámetro de cada burbuja. */
  bubbles: Record<Key, { cx: number; cy: number; d: number }>;
  /** Línea curva y el punto que la marca (en la burbuja o sobre el cuerpo). */
  lines: Record<Key, { path: string; dot: [number, number] }>;
  /** Tamaños de texto en % del ancho del contenedor. */
  text: {
    icon: number;
    name: number;
    tech: number;
    value: number;
    unit: number;
  };
};

export const WIDE: Layout = {
  size: [560, 470],
  lunito: { left: 115, top: 95, width: 300 },
  bubbles: {
    bpm: { cx: 83, cy: 70, d: 132 },
    hrv: { cx: 457, cy: 76, d: 152 },
    spo2: { cx: 457, cy: 355, d: 152 },
  },
  lines: {
    bpm: { path: "M68,135 C62,200 80,255 160,268", dot: [68, 135] },
    hrv: { path: "M466,147 C470,200 440,245 365,255", dot: [466, 147] },
    spo2: { path: "M385,348 C350,350 310,345 283,308", dot: [283, 308] },
  },
  text: { icon: 5.4, name: 3.5, tech: 2.5, value: 6.2, unit: 3.5 },
};

export const NARROW: Layout = {
  size: [380, 385],
  lunito: { left: 62, top: 115, width: 236 },
  bubbles: {
    bpm: { cx: 64, cy: 60, d: 118 },
    hrv: { cx: 308, cy: 63, d: 126 },
    spo2: { cx: 315, cy: 325, d: 120 },
  },
  lines: {
    bpm: { path: "M33,115 C30,175 55,235 100,255", dot: [33, 115] },
    hrv: { path: "M326,133 C328,185 305,225 282,223", dot: [326, 133] },
    spo2: { path: "M252,315 C225,312 210,300 192,285", dot: [192, 285] },
  },
  text: { icon: 7.4, name: 4.5, tech: 3, value: 7.7, unit: 4.4 },
};

/** Debajo de este ancho (px) se usa la medida de celular. */
export const NARROW_BELOW = 500;

export const layoutFor = (width: number) =>
  width > 0 && width < NARROW_BELOW ? NARROW : WIDE;
