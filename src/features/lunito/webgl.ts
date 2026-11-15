// ¿Este navegador puede dibujar WebGL? Sin él, Lunito se queda en imagen y
// los lienzos 3D no se montan (three.js lanza un error si no hay contexto).

let webgl: boolean | undefined;

/** Se pregunta una vez: crea un contexto de prueba y lo suelta. */
export function hasWebGL(): boolean {
  if (webgl !== undefined) return webgl;
  if (typeof WebGLRenderingContext === "undefined") return (webgl = false);
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    webgl = gl !== null;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl = false;
  }
  return webgl;
}
