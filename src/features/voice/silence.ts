// Cuándo dejar de escuchar sin que la persona toque nada: después de oírla
// hablar, un silencio sostenido es "ya terminé". Mientras no haya hablado no
// corta (el tope de segundos de `useVoiceInput` ya cubre el no decir nada).

/** Volumen (0 a 1, de `rmsLevel`) por encima del cual hay voz. */
export const VOICE_LEVEL = 0.1;

/** Devuelve `true` cuando ya hubo voz y el silencio llegó a `quietMs`. */
export function silenceDetector(quietMs = 1400) {
  let spoke = false;
  let quietSince: number | null = null;
  return (level: number, now: number): boolean => {
    if (level >= VOICE_LEVEL) {
      spoke = true;
      quietSince = null;
      return false;
    }
    if (!spoke) return false;
    quietSince ??= now;
    return now - quietSince >= quietMs;
  };
}
