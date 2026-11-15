// Check-in: sensor, prueba de reacción y resultado.
export const checkin = {
  // Confirmación al guardar la bitácora, antes de los pasos opcionales.
  saved: "Voice log saved",
  sensor: {
    title: "Place your finger on the sensor",
    caption: "Keep it still for 60 seconds.",
    // El sensor de la demo no existe: se dice así.
    simulated: "Simulated sensor for the demo",
    start: "Start reading",
    hold: "Keep your finger still",
    complete: "Reading complete",
    progress: "Sensor reading",
    seconds: "{seconds} s",
    next: "Continue",
    skip: "Skip the sensor",
  },
  reaction: {
    title: "Reaction test",
    caption:
      "Tap the box as soon as it changes color. It measures fatigue, not skill.",
    idle: "Tap to start",
    waiting: "Wait for the signal…",
    signal: "Tap now!",
    early: "Too soon. Tap to try again",
    done: "Test complete",
    attempt: "Try {n} of {total}",
    summary: "Average {mean} ms · lapses over {lapse} ms: {lapses}",
    note: "Demo version with 5 tries. The validated test lasts 3 minutes (Basner 2011).",
    next: "See my result",
    skip: "Skip the test",
  },
  result: {
    title: "Thanks for telling me",
    // Mismo nombre que la pantalla de Inicio: es la misma lectura.
    today: "How you're doing today",
    statusReason: "{status} · {reason}",
    forToday: "For today",
    goHome: "Go to Home",
    done: "Done!",
  },
};
