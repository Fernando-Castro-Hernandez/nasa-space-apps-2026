// Encuadre de Lunito en el dashboard: de qué punto del cuerpo sale cada dato
// y cuánto acercar la cámara para que Lunito sea grande sin cortar tarjetas.
import type { Anchor } from "@/features/lunito/LunitoScene";

// Branquias (oxígeno), pancita (pulso) y cuerpo (recuperación), en ese
// orden. Coordenadas sobre el modelo real (public/lunito.glb) ya escalado.
const ANCHORS: Anchor[] = [
  [1.2, 0.48, 0.07],
  [-0.7, -0.64, 0.74],
  [0.81, -1.05, 0.4],
];
// En un canvas angosto no hay espacio junto a la punta de la branquia.
const ANCHORS_NARROW: Anchor[] = [
  [0.92, 0.48, 0.07],
  [-0.7, -0.64, 0.74],
  [0.68, -1.0, 0.4],
];

const NARROW_CANVAS = 600;
export const isNarrow = (width: number) => width < NARROW_CANVAS;

export const anchorsFor = (width: number) =>
  isNarrow(width) ? ANCHORS_NARROW : ANCHORS;

/** Mitad del ancho visible, en unidades de escena. Lunito tan grande como se
 *  pueda, con la condición de que el dato más a la derecha (ancla + línea +
 *  tarjeta, en px) quepa en la mitad del canvas. */
export const halfWidthFor = (width: number) => {
  const half = width / 2;
  const anchorX = isNarrow(width) ? 0.92 : 1.2;
  const calloutPx = isNarrow(width) ? 108 : 195;
  const minHalfWidth = 1.7; // Lunito mide ~2.6 unidades de ancho
  if (half <= calloutPx + 40) return 4;
  return Math.max(minHalfWidth, (anchorX * half) / (half - calloutPx));
};
