import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { t } from "@/i18n";

type Props = {
  Icon: LucideIcon;
  title: string;
  subtitle?: string;
  /** Texto a la derecha, como una hora. */
  value?: string;
  /** Algo a la derecha que no es texto (un interruptor). */
  aside?: ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
  /**
   * Función que aún no existe: se dibuja como en la referencia, pero no es
   * un control ni lleva flecha, porque no lleva a ningún lado.
   */
  soon?: boolean;
  children?: ReactNode;
};

export function SettingsRow({
  Icon,
  title,
  subtitle,
  value,
  aside,
  expanded,
  onToggle,
  soon,
  children,
}: Props) {
  const content = (
    <>
      <Icon aria-hidden="true" strokeWidth={1.7} />
      <span className="settings-row-text">
        <strong>{title}</strong>
        {subtitle && <span>{subtitle}</span>}
        {soon && (
          <span className="settings-soon">{t("common.comingSoon")}</span>
        )}
      </span>
      {value && <span className="settings-value">{value}</span>}
      {aside}
    </>
  );

  if (soon)
    return (
      <div className="settings-row" data-soon="">
        {content}
      </div>
    );

  return (
    <div className="settings-item">
      <button
        type="button"
        className="settings-row"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        {content}
        <ChevronRight aria-hidden="true" className="settings-chevron" />
      </button>
      {expanded && <div className="settings-panel">{children}</div>}
    </div>
  );
}
