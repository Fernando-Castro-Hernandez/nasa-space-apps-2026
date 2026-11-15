import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  Icon: LucideIcon;
  title: string;
  subtitle?: string;
  /** Right-hand text such as a time; shown before the chevron. */
  value?: string;
  expanded?: boolean;
  onToggle?: () => void;
  /** Feature not built yet: rendered like the mockup but inert. */
  soon?: boolean;
  children?: ReactNode;
};

export function SettingsRow({
  Icon,
  title,
  subtitle,
  value,
  expanded,
  onToggle,
  soon,
  children,
}: Props) {
  return (
    <div className="settings-item">
      <button
        type="button"
        className="settings-row"
        disabled={soon}
        aria-expanded={soon ? undefined : expanded}
        onClick={onToggle}
      >
        <Icon aria-hidden="true" strokeWidth={1.7} />
        <span className="settings-row-text">
          <strong>{title}</strong>
          {subtitle && <span>{subtitle}</span>}
        </span>
        {soon && <span className="settings-soon">Próximamente</span>}
        {value && <span className="settings-value">{value}</span>}
        <ChevronRight aria-hidden="true" className="settings-chevron" />
      </button>
      {expanded && <div className="settings-panel">{children}</div>}
    </div>
  );
}
