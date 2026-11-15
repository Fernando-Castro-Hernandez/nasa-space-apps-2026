// Cambia el tono de la pancita al color del semáforo sin taparla: conserva
// la luz y las sombras de su textura, solo cambia el matiz (DISENO.md, "Lunito
// en 3D"). Se aplica después de leer la textura y solo a lo que es cian, así
// el borde de piel azul-lavanda queda igual.
//
// Antes se giraba el matiz (rotación alrededor del eje gris): el centro casi
// blanco salía pálido y el borde azul salía de otro color que el centro. Ahora
// todo lo cian toma el matiz del estado, con saturación suficiente para que se
// lea como ese color.
import type { Color, MeshStandardMaterial } from "three";

/** Altura (en la pancita) donde empiezan los pies: el borde de abajo de la
 *  malla trae trocitos cian sobre los pies que no deben teñirse. */
const FEET_TOP = -0.4;

export type StatusTint = {
  /** Color del estado (STATUS_COLOR), en el espacio de trabajo de three. */
  color: { value: Color };
  /** 0: la pancita en su cian natural (Bien); 1: del color del estado. */
  amount: { value: number };
};

/** Prepara el material de la pancita la primera vez; devuelve sus controles. */
export function statusTint(m: MeshStandardMaterial, color: Color): StatusTint {
  const existing = m.userData.statusTint as StatusTint | undefined;
  if (existing) return existing;

  const tint: StatusTint = { color: { value: color }, amount: { value: 0 } };
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTintColor = tint.color;
    shader.uniforms.uTintAmount = tint.amount;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
varying float vTintY;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
vTintY = position.y;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform vec3 uTintColor;
uniform float uTintAmount;
varying float vTintY;
vec3 toHsv(vec3 c) {
  float hi = max(c.r, max(c.g, c.b));
  float d = hi - min(c.r, min(c.g, c.b));
  float h = 0.0;
  if (d > 1e-5) {
    if (hi == c.r) h = mod((c.g - c.b) / d, 6.0);
    else if (hi == c.g) h = (c.b - c.r) / d + 2.0;
    else h = (c.r - c.g) / d + 4.0;
  }
  return vec3(h / 6.0, hi > 0.0 ? d / hi : 0.0, hi);
}
vec3 toRgb(vec3 c) {
  vec3 p = abs(fract(c.xxx + vec3(1.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
  return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
}`,
      )
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
float cyanness = smoothstep(0.0, 0.3, min(diffuseColor.g, diffuseColor.b) - diffuseColor.r)
  * smoothstep(${FEET_TOP - 0.06}, ${FEET_TOP}, vTintY);
vec3 own = toHsv(diffuseColor.rgb);
vec3 target = toHsv(uTintColor);
vec3 tinted = toRgb(vec3(target.x, max(own.y, target.y * 0.85), own.z));
diffuseColor.rgb = mix(diffuseColor.rgb, tinted, cyanness * uTintAmount);`,
      );
  };
  m.customProgramCacheKey = () => "lunito-status-tint";
  m.userData.statusTint = tint;
  m.needsUpdate = true;
  return tint;
}
