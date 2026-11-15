// Tripulación: privacidad, compañero del día, autonomía y balanceador.
import type { Messages } from "../../translate";
import type { crew as source } from "../en/crew";

export const crew: Messages<typeof source> = {
  // Botón "Enviar ánimo" (EncourageButton) y el aviso a quien lo recibe.
  encourage: {
    send: "Enviar ánimo",
    sent: "Ánimo enviado a {name}",
    received: "{name} te mandó ánimo",
    // Varios nombres ya unidos: "Ana y Mei".
    receivedMany: "{names} te mandaron ánimo",
  },
  // PrivacyCard (Configuración).
  privacy: {
    title: "Tu privacidad",
    description: "Solo se comparte tu estado general, sin cifras ni motivos.",
    share: "Compartir mi estado con la tripulación",
  },
  // Acción del compañero del día (companion.ts).
  companion: {
    action: "toma el café con {name}",
  },
  // Meta común de autonomía (AutonomyCard).
  autonomy: {
    title: "Autonomía de la tripulación",
    phaseGoal: "{phase} · Meta {goal}",
    handled: "{count} de {total} casos bien atendidos",
    escalating: "Escalar un caso a tiempo también cuenta.",
    byHazard: "Por peligro",
    hazardCount: "{count} de {total}",
  },
  // Balanceador de carga, solo para el comandante (LoadBalancer).
  balancer: {
    title: "Balanceador de carga",
    proposal:
      "{name}: {status} por {hazard}. ¿Intercambiar su {task} con {to}?",
    approve: "Aprobar",
    reject: "Rechazar",
    approved: "Aprobado: {to} hará la {task}.",
    rejected: "Rechazado: {name} mantiene la {task}.",
    undo: "Deshacer",
    // Tareas simuladas de la demo (swap.ts).
    tasks: {
      spacewalk: "caminata espacial",
      moduleCheck: "revisión de módulos",
    },
  },
};
