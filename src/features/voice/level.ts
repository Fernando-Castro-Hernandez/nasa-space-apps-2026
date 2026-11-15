// Volumen de una señal de audio, de 0 a 1. Lo usan la onda del micrófono y la
// boca de Lunito.

/** Volumen RMS del instante actual. `gain` ajusta la sensibilidad. */
export function rmsLevel(
  analyser: AnalyserNode,
  samples: Uint8Array<ArrayBuffer>,
  gain = 4,
): number {
  analyser.getByteTimeDomainData(samples);
  return levelOf(samples, gain);
}

/** Muestras de 8 bits centradas en 128, como las entrega un AnalyserNode. */
export function levelOf(samples: Uint8Array, gain = 4): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (const sample of samples) {
    const x = (sample - 128) / 128;
    sum += x * x;
  }
  return Math.min(1, Math.sqrt(sum / samples.length) * gain);
}
