// Panel oculto de la demo.
import type { Messages } from "../../translate";
import type { demo as source } from "../en/demo";

export const demo: Messages<typeof source> = {
  intro:
    "Cada botón dispara un evento simulado para mostrar el paso en el momento justo.",
  co2: {
    // Módulo donde la demo sube el CO₂ (también lo nombra el panel del comandante).
    module: "Módulo de laboratorio",
    raise: "Subir el CO₂ de un módulo",
    high: "CO₂ alto en el módulo de laboratorio: marcar resuelto a bordo",
    solved: "CO₂ resuelto a bordo",
  },
  emergency: {
    simulate: "Simular la emergencia de {name}",
    opened: "Caso abierto de {name}.",
    viewShip: "Ver en Emergencia",
    viewGround: "Ver en la consola de Tierra",
  },
  reading: "Lectura que muestra Inicio",
  sensor: {
    using:
      "{name} tiene una lectura del sensor de hoy ({bpm}\u00a0lpm, {spo2}\u00a0%). Con “{first}” elegido, Inicio muestra esa lectura en vez de la de muestra.",
    discard: "Quitar la lectura del sensor",
  },
  reset: {
    button: "Reiniciar los datos de la demo",
    confirm:
      "Se borra todo lo que la demo guardó en este dispositivo: check-in, bitácora, tareas, ánimos, perfil, privacidad, caso, CO₂ y lectura.",
    yes: "Sí, reiniciar",
    done: "Datos de la demo reiniciados.",
  },
  lab: "Galería de Lunito 3D",
  build: "Entorno: {env} · Commit: {commit}",
};
