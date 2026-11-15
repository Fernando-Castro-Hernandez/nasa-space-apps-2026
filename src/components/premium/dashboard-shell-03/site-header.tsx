// Adaptado de dashboard-shell-03: el header muestra en qué pantalla estás y el
// botón de emergencia, siempre visible (SISTEMA.md §7.5).
import { TriangleAlert } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

type Props = { title: string; subtitle?: string; hideEmergency?: boolean };

export function SiteHeader({ title, subtitle, hideEmergency }: Props) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="-ml-1 size-8 cursor-pointer" />
        <div className="min-w-0 leading-tight">
          <h1 className="truncate text-base font-semibold">{title}</h1>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!hideEmergency && (
          <a
            href="/emergencia"
            className="flex h-10 items-center gap-2 rounded-full border border-status-alert px-4 text-sm font-semibold text-status-alert hover:bg-status-alert hover:text-white"
          >
            <TriangleAlert className="size-4" aria-hidden="true" />
            Emergencia
          </a>
        )}
        <Avatar className="size-8">
          <AvatarFallback>AN</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
