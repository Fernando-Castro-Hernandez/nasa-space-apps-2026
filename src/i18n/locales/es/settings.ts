// Pantalla de Configuración.
import type { Messages } from "../../translate";
import type { settings as source } from "../en/settings";

export const settings: Messages<typeof source> = {
  profile: {
    change: "Cambiar perfil. Perfil actual: {name}",
    // Bajo el nombre: "Especialista de misión · Día 142 · Tránsito a Marte".
    subtitle: "{role} · Día {day} · {phase}",
  },
  lunito: {
    title: "Mi Lunito",
    subtitle: "Apariencia y estilos",
  },
  language: {
    title: "Idioma",
  },
  privacy: {
    heading: "Privacidad",
    title: "Datos compartidos",
    subtitle: "Tu tripulación ve solo tu estado general",
  },
  reminders: {
    heading: "Recordatorios",
    notifications: "Notificaciones",
    daily: "Recordatorio diario",
  },
  links: {
    heading: "Tierra y demo",
    label: "Accesos de Tierra y de la demo",
    ground: "Consola de Tierra",
    demo: "Panel de la demo",
    // El mismo nombre que la tarea y el título: check-in.
    dayStart: "Repetir el check-in de hoy",
  },
  // Los avisos generales de la app viven aquí, una sola vez.
  notices: {
    label: "Sobre este prototipo",
    simulated: "Datos simulados para la demo.",
  },
};
