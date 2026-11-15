// Mapa de pantallas (SISTEMA.md §9) y la navegación lateral que sale de él.
// Cada pantalla vive en la carpeta de su responsable (REPARTO.md).
import type { ComponentType } from "react";
import {
  Activity,
  BriefcaseMedical,
  Mic,
  Moon,
  Radio,
  Users,
} from "lucide-react";
import type { NavItem } from "@/components/premium/dashboard-shell-03/app-sidebar";
import { CREW, ME, MISSION } from "@/data/crew";
import { CheckInScreen } from "@/features/check-in/CheckInScreen";
import { CrewScreen } from "@/features/crew/CrewScreen";
import { EmergencyScreen } from "@/features/emergency/EmergencyScreen";
import { GroundConsoleScreen } from "@/features/emergency/GroundConsoleScreen";
import { HomeScreen } from "@/features/lunito/HomeScreen";
import { MedicineScreen } from "@/features/medicine/MedicineScreen";
import { StatusScreen } from "@/features/status/StatusScreen";

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
  { path: "/", title: "Mi Lunito", Screen: HomeScreen, shell: true },
  { path: "/estado", title: "Mi estado", Screen: StatusScreen, shell: true },
  { path: "/check-in", title: "Check-in", Screen: CheckInScreen, shell: true },
  {
    path: "/tripulacion",
    title: "Tripulación",
    Screen: CrewScreen,
    shell: true,
  },
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
  ROUTES.find((r) => r.path === path) ?? ROUTES[0]!;

export const NAV: NavItem[] = [
  { label: "Mi salud", isSection: true },
  { title: "Lunito", icon: Moon, href: "/" },
  { title: "Mi estado", icon: Activity, href: "/estado" },
  { title: "Check-in", icon: Mic, href: "/check-in" },
  { label: "Misión", isSection: true },
  { title: "Tripulación", icon: Users, href: "/tripulacion" },
  { title: "Botiquín", icon: BriefcaseMedical, href: "/botiquin" },
  { label: "Tierra", isSection: true },
  { title: "Consola del cirujano", icon: Radio, href: "/tierra" },
];
