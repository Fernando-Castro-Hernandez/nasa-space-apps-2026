// Segundos transcurridos mientras `running` es verdadero, hasta `limit`.
import { useEffect, useState } from "react";

export function useElapsed(running: boolean, limit: number) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!running) return;
    const start = performance.now() - elapsed * 1000;
    const id = window.setInterval(() => {
      const next = (performance.now() - start) / 1000;
      setElapsed(Math.min(limit, next));
    }, 250);
    return () => window.clearInterval(id);
    // `elapsed` solo fija el punto de partida al reanudar.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [running, limit]);
  return [elapsed, setElapsed] as const;
}
