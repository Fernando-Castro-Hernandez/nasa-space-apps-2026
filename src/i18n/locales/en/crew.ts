// Tripulación: privacidad, compañero del día, autonomía y balanceador.
export const crew = {
  // Botón "Enviar ánimo" (EncourageButton) y el aviso a quien lo recibe.
  encourage: {
    send: "Send encouragement",
    sent: "Sent to {name}",
    received: "{name} sent you encouragement",
    // Varios nombres ya unidos: "Ana and Mei".
    receivedMany: "{names} sent you encouragement",
  },
  // PrivacyCard (Configuración).
  privacy: {
    title: "Your privacy",
    description:
      "Only your overall status is shared, never numbers or reasons.",
    share: "Share my status with the crew",
  },
  // Acción del compañero del día (companion.ts).
  companion: {
    action: "have coffee with {name}",
  },
  // Meta común de autonomía (AutonomyCard).
  autonomy: {
    title: "Crew autonomy",
    phaseGoal: "{phase} · Goal {goal}",
    handled: "{count} of {total} cases handled well",
    escalating: "Escalating a case in time counts too.",
    byHazard: "By hazard",
    hazardCount: "{count} of {total}",
  },
  // Balanceador de carga, solo para el comandante (LoadBalancer).
  balancer: {
    title: "Workload balancer",
    proposal: "{name}: {status} due to {hazard}. Swap their {task} with {to}?",
    approve: "Approve",
    reject: "Decline",
    approved: "Approved: {to} takes the {task}.",
    rejected: "Declined: {name} keeps the {task}.",
    undo: "Undo",
    // Tareas simuladas de la demo (swap.ts).
    tasks: {
      spacewalk: "spacewalk",
      moduleCheck: "module inspection",
    },
  },
};
