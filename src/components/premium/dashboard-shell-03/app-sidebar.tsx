import type { ReactNode } from "react";
import { Orbit, TriangleAlert, type LucideIcon } from "lucide-react";
import { crewMember, MISSION } from "@/data/crew";
import { useActiveProfile } from "@/features/profiles/activeProfile";

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
  hideEmergency?: boolean;
};
export default function AppShell({
  children,
  nav,
  pathname,
  title,
  hideEmergency,
}: Props) {
  const person = crewMember(useActiveProfile());
  const immersive = pathname === "/check-in" || pathname === "/emergencia";
  return (
    <div className={`orbita-app ${immersive ? "orbita-immersive" : ""}`}>
      <a href="#app-content" className="skip-link">
        Ir al contenido
      </a>
      <header className="orbita-top">
        <a href="/" className="orbita-brand">
          <Orbit aria-hidden="true" />
          Nóstos
        </a>
        <p className="orbita-telemetry">
          Día {MISSION.day} · Fase {MISSION.phase}
        </p>
        <a
          href="/ajustes"
          className="orbita-profile"
          aria-label={`Perfil de ${person.name}`}
        >
          <span>{person.name}</span>
          <b>{person.name.slice(0, 2).toUpperCase()}</b>
        </a>
        {!hideEmergency && (
          <a href="/emergencia" className="orbita-sos">
            <TriangleAlert aria-hidden="true" />
            Emergencia
          </a>
        )}
      </header>
      <main id="app-content" tabIndex={-1}>
        <h1 className={pathname === "/" ? "sr-only" : "orbita-page-title"}>
          {title}
        </h1>
        {children}
      </main>
      {!immersive && (
        <nav className="orbita-tabs" aria-label="Principal">
          {nav
            .filter((item) => item.href)
            .map(({ href, title: label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
              >
                {Icon && <Icon aria-hidden="true" />}
                <span>{label}</span>
              </a>
            ))}
        </nav>
      )}
    </div>
  );
}
