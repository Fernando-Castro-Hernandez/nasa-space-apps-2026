// Gira el tono de la textura de un material sin taparla: la pancita conserva
// su degradado y sus brillos, solo cambia de color. Rotación alrededor del eje
// gris (fórmula de Rodrigues), aplicada después de leer la textura.
import type { MeshStandardMaterial } from "three";

type HueUniform = { value: number };

export function hueShiftUniform(m: MeshStandardMaterial): HueUniform {
  const existing = m.userData.hueShift as HueUniform | undefined;
  if (existing) return existing;

  const uniform: HueUniform = { value: 0 };
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uHueShift = uniform;
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform float uHueShift;
vec3 hueShift(vec3 c, float a) {
  const vec3 k = vec3(0.57735);
  float ca = cos(a);
  return c * ca + cross(k, c) * sin(a) + k * dot(k, c) * (1.0 - ca);
}`,
      )
      .replace(
        "#include <map_fragment>",
        // Solo gira lo que es cian: el borde de piel azul-lavanda queda igual
        // y la transición sigue el degradado de la textura.
        `#include <map_fragment>
float cyanness = smoothstep(0.05, 0.3, min(diffuseColor.g, diffuseColor.b) - diffuseColor.r);
diffuseColor.rgb = mix(diffuseColor.rgb, hueShift(diffuseColor.rgb, uHueShift), cyanness);`,
      );
  };
  m.userData.hueShift = uniform;
  m.needsUpdate = true;
  return uniform;
}
