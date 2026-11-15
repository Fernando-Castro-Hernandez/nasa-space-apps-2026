// Mapa de pantallas (SISTEMA.md §9) y la navegación lateral que sale de él.
// Cada pantalla vive en la carpeta de su responsable (REPARTO.md).
import type { ComponentType } from "react";
import { ListChecks, Orbit, Settings, Users } from "lucide-react";
import type { NavItem } from "@/components/premium/dashboard-shell-03/app-sidebar";
import { CREW, ME, MISSION } from "@/data/crew";
import { CheckInScreen } from "@/features/check-in/CheckInScreen";
import { EmergencyScreen } from "@/features/emergency/EmergencyScreen";
import { GroundConsoleScreen } from "@/features/emergency/GroundConsoleScreen";
import { LunitoHomeScreen } from "@/features/lunito-home/LunitoHomeScreen";
import { ReferenceSettingsScreen } from "@/features/lunito-home/settings/SettingsScreen";
import { ReferenceTasksScreen } from "@/features/lunito-home/tasks/TasksScreen";
import { TeamScreen } from "@/features/lunito-home/team/TeamScreen";
import { MedicineScreen } from "@/features/medicine/MedicineScreen";
import { StatusScreen } from "@/features/status/StatusScreen";
import { DemoScreen } from "@/features/demo/DemoScreen";

export type Route = {
  path: string;
  title: string;
  Screen: ComponentType;
  /** false: pantalla completa sin barra lateral (consola de Tierra). */
  shell: boolean;
};

const me = CREW.find((c) => c.id === ME)!;
export const SUBTITLE = `${me.name} · Día ${MISSION.day} · ${MISSION.phase}`;

export const ROUTES: Route[] = [
  // The four bottom-nav screens bring their own header and nav (DISENO.md).
  {
    path: "/ajustes",
    title: "Configuración",
    Screen: ReferenceSettingsScreen,
    shell: false,
  },
  {
    path: "/tareas",
    title: "Tareas",
    Screen: ReferenceTasksScreen,
    shell: false,
  },
  { path: "/demo", title: "Panel de la demo", Screen: DemoScreen, shell: true },
  { path: "/", title: "Inicio", Screen: LunitoHomeScreen, shell: false },
  { path: "/estado", title: "Mi estado", Screen: StatusScreen, shell: true },
  { path: "/check-in", title: "Check-in", Screen: CheckInScreen, shell: true },
  { path: "/tripulacion", title: "Equipo", Screen: TeamScreen, shell: false },
  { path: "/botiquin", title: "Botiquín", Screen: MedicineScreen, shell: true },
  {
    path: "/emergencia",
    title: "Emergencia a bordo",
    Screen: EmergencyScreen,
    shell: true,
  },
  {
    path: "/tierra",
    title: "Consola del cirujano de vuelo",
    Screen: GroundConsoleScreen,
    shell: false,
  },
];

export const findRoute = (path: string) =>
  ROUTES.find((r) => r.path === path) ?? ROUTES.find((r) => r.path === "/")!;

export const NAV: NavItem[] = [
  { title: "Inicio", icon: Orbit, href: "/" },
  { title: "Equipo", icon: Users, href: "/tripulacion" },
  { title: "Tareas", icon: ListChecks, href: "/tareas" },
  { title: "Ajustes", icon: Settings, href: "/ajustes" },
];
