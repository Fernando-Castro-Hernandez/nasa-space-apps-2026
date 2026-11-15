// Check-in: sensor, prueba de reacción y resultado.
export const checkin = {
  // Confirmación al guardar la bitácora, antes de los pasos opcionales.
  saved: "Voice log saved",
  sensor: {
    title: "Place your finger on the sensor",
    caption: "Keep it still for 60 seconds.",
    // Sin la estación conectada la lectura es simulada: se dice así.
    simulated: "Simulated sensor for the demo",
    unsupported:
      "This browser can't connect to the sensor (it needs Chrome). Simulated sensor for the demo.",
    live: "Live reading from the station sensor. Prototype, not a medical device.",
    connect: "Connect sensor",
    connecting: "Connecting…",
    reconnect: "Reconnect sensor",
    lost: "The sensor connection was lost.",
    useSimulated: "Use a simulated reading",
    waiting:
      "Place your finger on the sensor. The first values take about 10 seconds.",
    settling: "Reading your pulse… keep your finger still.",
    moved: "Keep your finger still. Starting over.",
    short: "The signal was too weak to save. Starting over.",
    again: "Measure again",
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
