// Encuadre del avatar: el mismo que las imágenes de Lunito de la UI Marea
// (src/features/day-checkin/assets/lunito-*.webp, 800 × 800). En esas
// imágenes Lunito ocupa unos 742 px de alto, centrado y un poco arriba. El 3D
// encuadra el mismo cuadrado, así la imagen y el modelo coinciden al fundirse.
// Función pura: no sabe de three.js.

/** Cuadro de las imágenes en unidades del modelo (mide 2 de alto, con el
 *  origen al centro). Medido sobre las capturas del lab (/lunito). */
export const PORTRAIT = {
  /** Lado del cuadrado. */
  size: 2.127,
  /** Altura del centro del cuadrado. */
  centerY: -0.049,
};

/** Cámara: casi de frente y apenas desde arriba, como en las ilustraciones. */
export const CAMERA = { fov: 20, elevation: 5 };

/**
 * Cuánto se sale el lienzo de la caja del avatar por cada lado (proporción
 * del lado de la caja). En reposo Lunito llena la caja como la imagen; al
 * saltar o ladearse, las branquias pasan del borde y no deben cortarse.
 */
export const BLEED = 0.1;

/** Lunito cabe en una esfera de este radio alrededor del cuadro. */
const DEPTH = 2;

export type CameraPlacement = {
  position: [number, number, number];
  target: [number, number, number];
  /** Planos de corte ajustados al modelo: así el párpado, plegado casi
   *  pegado al ojo, no parpadea por falta de precisión. */
  near: number;
  far: number;
};

/**
 * Dónde va la cámara para que el cuadro quepa entero en un lienzo de
 * proporción `aspect` (ancho / alto), centrado, como `object-fit: contain`.
 * Con `bleed`, el lienzo es más grande que la caja en esa proporción por
 * lado, y el cuadro sigue ocupando la caja.
 */
export function placeCamera(
  aspect: number,
  bleed = BLEED,
  { size, centerY } = PORTRAIT,
  { fov, elevation } = CAMERA,
): CameraPlacement {
  const frame = size * (1 + 2 * bleed);
  const height = aspect >= 1 ? frame : frame / aspect;
  const distance = height / 2 / Math.tan((fov * Math.PI) / 360);
  const tilt = (elevation * Math.PI) / 180;
  return {
    position: [
      0,
      centerY + distance * Math.sin(tilt),
      distance * Math.cos(tilt),
    ],
    target: [0, centerY, 0],
    near: distance - DEPTH,
    far: distance + DEPTH,
  };
}
