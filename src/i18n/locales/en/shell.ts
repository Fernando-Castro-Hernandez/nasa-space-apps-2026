// Cabecera, barra de navegación, hojas y títulos de las rutas.
export const shell = {
  skipToContent: "Skip to content",
  // Título de la pestaña del navegador: "Tasks · Nóstos".
  documentTitle: "{title} · Nóstos",
  // A dónde vuelve cada pantalla secundaria (el texto junto a la flecha).
  back: {
    home: "Home",
    tasks: "Tasks",
    settings: "Settings",
    exit: "Exit",
  },
  // Las cuatro pestañas de la barra inferior.
  tabs: {
    home: "Home",
    crew: "Crew",
    tasks: "Tasks",
    settings: "Settings",
  },
  // Gráficas compartidas (components/premium): leyenda y línea base.
  charts: {
    average: "Your average",
    baseline: "Your baseline",
    baselineLine: "your baseline",
  },
  navLabel: "Main navigation",
  // Con un caso de emergencia abierto (franja roja bajo la cabecera).
  activeCase: {
    // "Qué pasó" llega ya traducido (whatLabel del caso).
    banner: "Emergency in progress · {name} · {what}",
    view: "View case",
  },
  // Título de cada ruta (h1 de las pantallas secundarias y pestaña del navegador).
  titles: {
    home: "Home",
    dayStart: "Morning check-in",
    crew: "Crew",
    tasks: "Tasks",
    settings: "Settings",
    status: "My status",
    medKit: "Med kit",
    emergency: "Emergency on board",
    // Como la nombran Configuración y la demo (glosario).
    ground: "Ground console",
    demo: "Demo panel",
  },
};
