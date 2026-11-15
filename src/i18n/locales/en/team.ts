// Equipo: constelación, hoja de cada compañero y autonomía.
export const team = {
  title: "Crew",
  heading: "Your crew",
  hint: "Tap a Lunito to see how they're doing",
  // Nombre accesible de cada Lunito de la constelación.
  view: "See {name}",
  buddy: "Buddy of the day",
  missionLabel: "Crew mission",
  // Hoja del compañero elegido.
  sheet: {
    label: "{name}'s details",
    title: "{name} · {status}",
    shared: "Shared status",
    notShared: "Not sharing their status",
  },
  // Con un caso de emergencia abierto (caseStore).
  emergency: {
    badge: "Emergency",
    title: "{name} · Emergency",
    since: "Case open since {time}",
    viewCase: "View case",
  },
};
