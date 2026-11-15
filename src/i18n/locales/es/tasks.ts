// Tareas del día.
import type { Messages } from "../../translate";
import type { tasks as source } from "../en/tasks";

export const tasks: Messages<typeof source> = {
  title: "Tareas",
  today: "Hoy",
  progress: "{count} de {total} completadas",
  progressLabel: "Progreso de hoy",
  // Fila del check-in: se marca sola cuando la bitácora de hoy está guardada.
  checkIn: {
    title: "Check-in del día",
    done: "Completado",
    doneAt: "Completado · {time}",
    start: "Comenzar",
  },
  // Acceso al Botiquín, justo bajo la lista.
  kit: {
    question: "¿Te sientes mal?",
    link: "Botiquín",
  },
  // Lunito celebra en pequeño al completar todo lo del día.
  allDone: "Todo listo por hoy. Lunito lo celebra.",
  // Bloques que el producto aún no tiene (se dibujan inertes).
  soon: {
    auroraLabel: "Aurora, próximamente",
    aurora: "Aurora · 2 tareas para desbloquear",
    auroraStyle: "Estilo de Lunito",
    reminderLabel: "Recordatorio, próximamente",
    reminder: "Próximo recordatorio",
  },
};
