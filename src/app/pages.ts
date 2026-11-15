// Dónde vive cada pantalla secundaria dentro de la navegación: a qué pantalla
// vuelve y qué pestaña queda marcada. Toda pantalla tiene una salida visible
// y pertenece a una de las cuatro pestañas.
import { t } from "@/i18n";
import type { BackLink } from "@/features/lunito-home/ReferenceChrome";

export type PagePlace = {
  back: BackLink;
  /** Pestaña marcada; sin ella la pantalla es inmersiva y no lleva barra. */
  tab?: string;
  /** false: la pantalla no muestra el botón Emergencia (ya es la emergencia). */
  emergency?: boolean;
  /** true: el título queda solo para lectores de pantalla. */
  hideTitle?: boolean;
};

const home = (): BackLink => ({ href: "/", label: t("shell.back.home") });
const tasks = (): BackLink => ({
  href: "/tareas",
  label: t("shell.back.tasks"),
});
const settings = (): BackLink => ({
  href: "/ajustes",
  label: t("shell.back.settings"),
});

/** Salir de Emergencia lleva a la pantalla de donde se vino (o a Inicio). */
export const exitTo = (previous: string | null) =>
  previous && previous !== "/emergencia" ? previous : "/";

/**
 * Lugar de la ruta `path`; lo que no se conoce vuelve a Inicio. `previous` es
 * la pantalla desde la que se llegó (`previousPath()` del router).
 */
export function pagePlace(
  path: string,
  previous: string | null = null,
): PagePlace {
  switch (path) {
    case "/estado":
      return { back: home(), tab: "/" };
    case "/botiquin":
      return { back: tasks(), tab: "/tareas" };
    case "/demo":
      return { back: settings(), tab: "/ajustes" };
    case "/emergencia":
      // Salir no cierra el caso: sigue abierto hasta que se cierre a propósito.
      // El aviso rojo de la pantalla es lo primero que se ve, no el título.
      return {
        back: { href: exitTo(previous), label: t("shell.back.exit") },
        emergency: false,
        hideTitle: true,
      };
    default:
      return { back: home() };
  }
}

// Direcciones viejas que ahora viven en otra pantalla.
const REDIRECTS = new Map([
  // Un solo check-in: el de la mañana.
  ["/check-in", "/buenos-dias"],
]);

/** A dónde se manda la dirección `path`, o null si se queda donde está. */
export const redirectFor = (path: string): string | null =>
  REDIRECTS.get(path) ?? null;

/** Título de la pestaña del navegador: "Tareas · Nóstos". */
export function showDocumentTitle(title: string) {
  document.title = t("shell.documentTitle", { title });
}
