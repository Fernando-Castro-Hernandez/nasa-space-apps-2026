import { useCallback, useEffect, useRef, useState } from "react";
import { rmsLevel, simulatedLevel } from "./waveform";

export function useMicLevel(active: boolean) {
  const [source, setSource] = useState<"starting" | "mic" | "demo">("starting");
  const level = useRef(0);
  const read = useRef<() => number>(() => 0);

  useEffect(() => {
    if (!active) return;
    const res: {
      cancelled: boolean;
      stream?: MediaStream;
      ctx?: AudioContext;
    } = { cancelled: false };
    const t0 = performance.now();
    const release = () => {
      res.stream?.getTracks().forEach((track) => track.stop());
      res.stream = undefined;
      if (!res.ctx) return;
      void res.ctx
        .close()
        .catch((error: unknown) =>
          console.warn("No se pudo cerrar el contexto de audio.", error),
        );
      res.ctx = undefined;
    };
    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia)
          throw new Error("Micrófono no disponible");
        res.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (res.cancelled) {
          release();
          return;
        }
        res.ctx = new AudioContext();
        const analyser = res.ctx.createAnalyser();
        analyser.fftSize = 512;
        res.ctx.createMediaStreamSource(res.stream).connect(analyser);
        const samples = new Float32Array(analyser.fftSize);
        read.current = () => {
          analyser.getFloatTimeDomainData(samples);
          return rmsLevel(samples);
        };
        setSource("mic");
      } catch (error) {
        console.warn("Micrófono no disponible; onda de demostración.", error);
        release();
        if (res.cancelled) return;
        read.current = () => simulatedLevel((performance.now() - t0) / 1000);
        setSource("demo");
      }
    };
    void start();
    return () => {
      res.cancelled = true;
      release();
      read.current = () => 0;
    };
  }, [active]);

  const getLevel = useCallback(() => {
    level.current += (read.current() - level.current) * 0.35;
    return level.current;
  }, []);
  return { source: active ? source : "starting", getLevel };
}
