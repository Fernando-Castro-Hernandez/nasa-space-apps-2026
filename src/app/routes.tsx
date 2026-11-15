// Mapa de pantallas (SISTEMA.md §9). Cada pantalla vive en la carpeta de su
// responsable (REPARTO.md); su lugar en la navegación está en pages.ts.
import type { ComponentType } from "react";
import { EmergencyScreen } from "@/features/emergency/EmergencyScreen";
import { GroundConsoleScreen } from "@/features/emergency/GroundConsoleScreen";
import { LunitoHomeScreen } from "@/features/lunito-home/LunitoHomeScreen";
import { ReferenceSettingsScreen } from "@/features/lunito-home/settings/SettingsScreen";
import { ReferenceTasksScreen } from "@/features/lunito-home/tasks/TasksScreen";
import { TeamScreen } from "@/features/lunito-home/team/TeamScreen";
import { MedicineScreen } from "@/features/medicine/MedicineScreen";
import { StatusScreen } from "@/features/status/StatusScreen";
import { DemoScreen } from "@/features/demo/DemoScreen";
import { LunitoLabRoute } from "@/features/lunito/lab/LunitoLabRoute";
import { t, type MessageKey } from "@/i18n";

export type Route = {
  path: string;
  /** Se lee al momento, en el idioma activo. */
  readonly title: string;
  Screen: ComponentType;
  /**
   * true: pantalla secundaria dentro de la estructura Marea (`MareaPage`).
   * false: trae su propia estructura (las cuatro pestañas y Tierra).
   */
  shell: boolean;
};

const route = (
  path: string,
  titleKey: MessageKey,
  Screen: ComponentType,
  shell: boolean,
): Route => ({
  path,
  get title() {
    return t(titleKey);
  },
  Screen,
  shell,
});

export const ROUTES: Route[] = [
  // Las cuatro pestañas de la barra inferior (DISENO.md).
  route("/", "shell.titles.home", LunitoHomeScreen, false),
  route("/tripulacion", "shell.titles.crew", TeamScreen, false),
  route("/tareas", "shell.titles.tasks", ReferenceTasksScreen, false),
  route("/ajustes", "shell.titles.settings", ReferenceSettingsScreen, false),
  // Pantallas secundarias: cuelgan de una pestaña (pages.ts).
  route("/estado", "shell.titles.status", StatusScreen, true),
  route("/botiquin", "shell.titles.medKit", MedicineScreen, true),
  route("/emergencia", "shell.titles.emergency", EmergencyScreen, true),
  route("/demo", "shell.titles.demo", DemoScreen, true),
  // Consola de escritorio para Tierra, con su propia estructura.
  route("/tierra", "shell.titles.ground", GroundConsoleScreen, false),
  // Galería interna de Lunito 3D: fuera de la navegación (se abre desde /demo).
  route("/lunito", "lunitoLab.title", LunitoLabRoute, false),
];

export const findRoute = (path: string) =>
  ROUTES.find((r) => r.path === path) ?? ROUTES[0];
