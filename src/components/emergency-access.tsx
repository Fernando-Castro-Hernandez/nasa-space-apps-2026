// Acceso a Emergencia, siempre a un toque: el botón de la cabecera (y de las
// hojas) y, con un caso abierto, la franja roja bajo la cabecera. Sin
// animación: en una emergencia no hay nada lúdico (SISTEMA.md §1).
import { ChevronRight, Plus, Siren } from "lucide-react";
import { cn } from "cn";
import { casePersonName, useActiveCase } from "@/app/activeCase";
import { whatLabel } from "@/features/emergency/caseLogic";
import { t } from "@/i18n";

/** "+ Emergencia"; con un caso abierto, "Ver caso" en rojo lleno. */
export function EmergencyLink({ className }: { className?: string }) {
  const active = useActiveCase();
  return (
    <a
      href="/emergencia"
      className={cn("emergency-link", className)}
      data-case={active ? "active" : undefined}
    >
      <Plus aria-hidden="true" />
      {active ? t("shell.activeCase.view") : t("common.emergency")}
    </a>
  );
}

/**
 * Franja fija con quién está en emergencia y el enlace al caso. La región
 * existe siempre (vacía sin caso) para que el lector de pantalla anuncie el
 * caso cuando se abre, aunque sea desde otra pestaña.
 */
export function ActiveCaseBanner({ className }: { className?: string }) {
  const active = useActiveCase();
  return (
    <output className={cn("case-banner-slot", className)}>
      {active && (
        <a href="/emergencia" className="case-banner">
          <Siren aria-hidden="true" />
          <span className="case-banner-text">
            {t("shell.activeCase.banner", {
              name: casePersonName(active),
              what: whatLabel(active.what),
            })}
          </span>
          <span className="case-banner-action">
            {t("shell.activeCase.view")}
            <ChevronRight aria-hidden="true" />
          </span>
        </a>
      )}
    </output>
  );
}
