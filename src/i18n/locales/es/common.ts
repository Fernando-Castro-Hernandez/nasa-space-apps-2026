// Palabras compartidas por toda la app: estados, unidades, botones genéricos y avisos.
import type { Messages } from "../../translate";
import type { common as source } from "../en/common";

export const common: Messages<typeof source> = {
  appName: "Nóstos",
  // Los tres estados del semáforo (DISENO.md): siempre color y palabra.
  status: {
    verde: "Bien",
    ambar: "Precaución",
    rojo: "Atención",
  },
  emergency: "Emergencia",
  simulated: "simulado",
  comingSoon: "Próximamente",
  notShared: "Sin compartir",
  notDiagnosis: "Prototipo, no es un diagnóstico.",
  // Lo que todavía no tiene fuente en FUENTES.md (reglas, umbrales, acciones).
  pendingValidation: "pendiente de validar",
  missionDay: "Día {day}",
  // Los cinco peligros de NASA (RIDGE, SISTEMA.md §3), por su letra.
  hazards: {
    R: "Radiación",
    I: "Aislamiento",
    D: "Distancia",
    G: "Gravedad",
    E: "Ambiente",
  },
  // Los tres indicadores de salud, como los nombra el glosario.
  metrics: {
    bpm: "Pulso",
    hrv: "Variabilidad cardíaca",
    spo2: "Oxígeno en sangre",
  },
  // Cada día en los ejes de las gráficas, de lunes a domingo. Tres letras,
  // como la consola de Tierra (y como el inglés, donde las iniciales se repiten).
  weekdays: {
    mon: "lun",
    tue: "mar",
    wed: "mié",
    thu: "jue",
    fri: "vie",
    sat: "sáb",
    sun: "dom",
  },
  /** Semana abreviada en los ejes de las gráficas: "Sem 1". */
  weekShort: "Sem {n}",
  units: {
    bpm: "lpm",
    ms: "ms",
    percent: "%",
    hours: "h",
    seconds: "s",
  },
  minutes: {
    one: "{count} minuto",
    other: "{count} minutos",
  },
  // Botones − y + de un número (components/ui/number-stepper).
  stepper: {
    decrease: "Reducir {label}",
    increase: "Aumentar {label}",
  },
  actions: {
    close: "Cerrar",
    cancel: "Cancelar",
    save: "Guardar",
    confirm: "Confirmar",
    back: "Volver",
    next: "Siguiente",
    retry: "Intentar de nuevo",
    edit: "Editar",
    send: "Enviar",
  },
};
