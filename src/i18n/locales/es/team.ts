// Equipo: constelación, hoja de cada compañero y autonomía.
import type { Messages } from "../../translate";
import type { team as source } from "../en/team";

export const team: Messages<typeof source> = {
  title: "Equipo",
  heading: "Tu tripulación",
  hint: "Toca un Lunito para ver cómo está",
  // Nombre accesible de cada Lunito de la constelación.
  view: "Ver a {name}",
  buddy: "Compañero del día",
  missionLabel: "Misión de la tripulación",
  // Hoja del compañero elegido.
  sheet: {
    label: "Detalle de {name}",
    title: "{name} · {status}",
    shared: "Estado compartido",
    notShared: "No comparte su estado",
  },
  // Con un caso de emergencia abierto (caseStore).
  emergency: {
    badge: "Emergencia",
    title: "{name} · Emergencia",
    since: "Caso abierto desde {time}",
    viewCase: "Ver caso",
  },
};
