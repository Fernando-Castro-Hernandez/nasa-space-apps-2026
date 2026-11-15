// Adaptado de dashboard-shell-03 (Shadcn Space Pro, revisión 8c005d44179c):
// navegación propia, sin widgets de demostración ni tarjeta promocional.
import type { ReactNode } from "react";
import { type LucideIcon, Moon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/premium/dashboard-shell-03/nav-main";
import { SiteHeader } from "@/components/premium/dashboard-shell-03/site-header";

export type NavItem = {
  label?: string;
  isSection?: boolean;
  title?: string;
  icon?: LucideIcon;
  href?: string;
  children?: NavItem[];
  isActive?: boolean;
};

type Props = {
  children: ReactNode;
  nav: NavItem[];
  pathname: string;
  title: string;
  subtitle?: string;
  /** Oculta el botón de emergencia (por ejemplo, dentro de la emergencia). */
  hideEmergency?: boolean;
};

const AppShell = ({
  children,
  nav,
  pathname,
  title,
  subtitle,
  hideEmergency,
}: Props) => (
  <SidebarProvider>
    <Sidebar className="bg-background px-0 py-4">
      <SidebarHeader className="px-4 py-0">
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Moon className="size-4" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Health Monitor</p>
            <p className="text-xs text-muted-foreground">Equipo Nóstos</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0 px-4 pt-4">
        <NavMain items={nav} pathname={pathname} />
      </SidebarContent>
    </Sidebar>

    <div className="flex min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-50 flex items-center border-b bg-background px-4 py-3 md:px-6">
        <SiteHeader
          title={title}
          subtitle={subtitle}
          hideEmergency={hideEmergency}
        />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  </SidebarProvider>
);

export default AppShell;
