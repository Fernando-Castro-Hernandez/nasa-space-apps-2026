// Panel oculto de la demo.
export const demo = {
  intro:
    "Each button triggers a simulated event, so you can show each step at the right moment.",
  co2: {
    // Módulo donde la demo sube el CO₂ (también lo nombra el panel del comandante).
    module: "Lab module",
    raise: "Raise CO₂ in a module",
    high: "High CO₂ in the lab module: mark it solved on board",
    solved: "CO₂ solved on board",
  },
  emergency: {
    simulate: "Simulate an emergency for {name}",
    opened: "Case open for {name}.",
    viewShip: "See it in Emergency",
    viewGround: "See it in the Ground console",
  },
  reading: "Reading shown on Home",
  // Cuando el perfil activo tiene hoy una lectura real de la estación.
  sensor: {
    using:
      "{name} has a sensor reading from today ({bpm}\u00a0bpm, {spo2}%). With “{first}” selected, Home shows that reading instead of the sample.",
    discard: "Discard the sensor reading",
  },
  reset: {
    button: "Reset demo data",
    confirm:
      "This clears everything the demo saved on this device: check-in, voice log, tasks, encouragement, profile, privacy, case, CO₂ and reading.",
    yes: "Yes, reset",
    done: "Demo data reset.",
  },
  lab: "Lunito 3D gallery",
  build: "Environment: {env} · Commit: {commit}",
};
