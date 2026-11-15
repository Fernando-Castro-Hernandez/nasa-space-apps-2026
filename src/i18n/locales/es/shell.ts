// Cabecera, barra de navegación, hojas y títulos de las rutas.
import type { Messages } from "../../translate";
import type { shell as source } from "../en/shell";

export const shell: Messages<typeof source> = {
  skipToContent: "Ir al contenido",
  // Título de la pestaña del navegador: "Tareas · Nóstos".
  documentTitle: "{title} · Nóstos",
  // A dónde vuelve cada pantalla secundaria (el texto junto a la flecha).
  back: {
    home: "Inicio",
    tasks: "Tareas",
    settings: "Ajustes",
    exit: "Salir",
  },
  // Las cuatro pestañas de la barra inferior.
  tabs: {
    home: "Inicio",
    crew: "Equipo",
    tasks: "Tareas",
    settings: "Ajustes",
  },
  // Gráficas compartidas (components/premium): leyenda y línea base.
  charts: {
    average: "Tu promedio",
    baseline: "Tu normal",
    baselineLine: "tu normal",
  },
  navLabel: "Navegación principal",
  // Con un caso de emergencia abierto (franja roja bajo la cabecera).
  activeCase: {
    // "Qué pasó" llega ya traducido (whatLabel del caso).
    banner: "Emergencia en curso · {name} · {what}",
    view: "Ver caso",
  },
  // Título de cada ruta (h1 de las pantallas secundarias y pestaña del navegador).
  titles: {
    home: "Inicio",
    dayStart: "Check-in del día",
    crew: "Equipo",
    tasks: "Tareas",
    // Como en la referencia 09: la pestaña dice "Ajustes" y el título "Configuración".
    settings: "Configuración",
    status: "Mi estado",
    medKit: "Botiquín",
    emergency: "Emergencia a bordo",
    // Como la nombran Configuración y la demo (glosario).
    ground: "Consola de Tierra",
    demo: "Panel de la demo",
  },
};
