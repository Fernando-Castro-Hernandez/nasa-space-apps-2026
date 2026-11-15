// Check-in: sensor, prueba de reacción y resultado.
import type { Messages } from "../../translate";
import type { checkin as source } from "../en/checkin";

export const checkin: Messages<typeof source> = {
  saved: "Bitácora guardada",
  sensor: {
    title: "Pon el dedo en el sensor",
    caption: "Déjalo quieto 60 segundos.",
    simulated: "Sensor simulado para la demo",
    start: "Empezar lectura",
    hold: "Mantén el dedo quieto",
    complete: "Lectura completa",
    progress: "Lectura del sensor",
    seconds: "{seconds} s",
    next: "Seguir",
    skip: "Saltar el sensor",
  },
  reaction: {
    title: "Prueba de reacción",
    caption:
      "Toca la caja en cuanto cambie de color. Mide tu fatiga, no tu habilidad.",
    idle: "Toca para empezar",
    waiting: "Espera la señal…",
    signal: "¡Toca ya!",
    early: "Muy pronto. Toca para reintentar",
    done: "Prueba terminada",
    attempt: "Intento {n} de {total}",
    summary: "Promedio {mean} ms · lapsos de más de {lapse} ms: {lapses}",
    note: "Versión de demo de 5 intentos. La versión validada dura 3 minutos (Basner 2011).",
    next: "Ver mi resultado",
    skip: "Saltar la prueba",
  },
  result: {
    title: "Gracias por contarme",
    today: "Así estás hoy",
    statusReason: "{status} · {reason}",
    forToday: "Para hoy",
    goHome: "Ir a Inicio",
    done: "¡Listo!",
  },
};
