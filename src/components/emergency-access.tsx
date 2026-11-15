// Acceso a Emergencia, siempre a un toque: el botón de la cabecera (y de las
// hojas), con un caso abierto la franja roja bajo la cabecera, y el aviso
// cuando lo que dice la persona suena a emergencia. Sin animación: en una
// emergencia no hay nada lúdico (SISTEMA.md §1).
import { ChevronRight, OctagonAlert, Plus, Siren } from "lucide-react";
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
 * Lo que dice Lunito ante una emergencia (lunitoRules.emergencyLine) con el
 * acceso a Emergencia. Es una alerta: el lector de pantalla la anuncia.
 */
export function EmergencyNotice({ line }: { line: string }) {
  return (
    <div role="alert" className="emergency-notice">
      <p>
        <OctagonAlert aria-hidden="true" />
        <span>{line}</span>
      </p>
      <a href="/emergencia" className="emergency-notice-link">
        {t("lunito.chat.openEmergency")}
      </a>
    </div>
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
          {/* "Ver caso" ya está en el botón de la cabecera, justo encima. */}
          <ChevronRight aria-hidden="true" />
        </a>
      )}
    </output>
  );
}
