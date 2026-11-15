import { CalendarCheck, House, Plus, Settings, Users } from "lucide-react";

export function ReferenceHeader({
  title = "Inicio",
  emergency = true,
}: {
  title?: string;
  emergency?: boolean;
}) {
  return (
    <header className="reference-header">
      <span>{title}</span>
      {emergency && (
        <a href="/emergencia" className="reference-emergency">
          <Plus aria-hidden="true" />
          Emergencia
        </a>
      )}
    </header>
  );
}

const links = [
  { label: "Inicio", href: "/", Icon: House },
  { label: "Equipo", href: "/tripulacion", Icon: Users },
  { label: "Tareas", href: "/tareas", Icon: CalendarCheck },
  { label: "Ajustes", href: "/ajustes", Icon: Settings },
];

export function ReferenceNav({ pathname }: { pathname: string }) {
  return (
    <nav className="reference-nav" aria-label="Navegación principal">
      {links.map(({ label, href, Icon }) => (
        <a
          key={href}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
        >
          <Icon aria-hidden="true" strokeWidth={1.8} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
