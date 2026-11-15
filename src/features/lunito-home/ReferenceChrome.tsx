// Estructura común de las pantallas Marea: cabecera con Emergencia siempre a
// la vista (y la franja roja si hay un caso abierto), barra inferior de cuatro
// pestañas y, para las pantallas secundarias, un contenedor con botón de
// volver (`MareaPage`).
import type { ReactNode } from "react";
import {
  CalendarCheck,
  ChevronLeft,
  House,
  Settings,
  Users,
} from "lucide-react";
import { ActiveCaseBanner, EmergencyLink } from "@/components/emergency-access";
import { t, type MessageKey } from "@/i18n";
import "./reference.css";

/** A dónde vuelve una pantalla secundaria y cómo se llama ese lugar. */
export type BackLink = { href: string; label: string };

export function ReferenceHeader({
  title = t("shell.tabs.home"),
  emergency = true,
  back,
}: {
  title?: string;
  /** false solo en la propia pantalla de Emergencia. */
  emergency?: boolean;
  /** Si viene, ocupa el lugar del título: "‹ Tareas". */
  back?: BackLink;
}) {
  return (
    <>
      <header className="reference-header">
        {back ? (
          <a href={back.href} className="reference-back">
            <ChevronLeft aria-hidden="true" />
            {back.label}
          </a>
        ) : (
          <span>{title}</span>
        )}
        {emergency && <EmergencyLink className="reference-emergency" />}
      </header>
      {emergency && <ActiveCaseBanner />}
    </>
  );
}

const links: {
  label: MessageKey;
  href: string;
  Icon: typeof House;
}[] = [
  { label: "shell.tabs.home", href: "/", Icon: House },
  { label: "shell.tabs.crew", href: "/tripulacion", Icon: Users },
  { label: "shell.tabs.tasks", href: "/tareas", Icon: CalendarCheck },
  { label: "shell.tabs.settings", href: "/ajustes", Icon: Settings },
];

export function ReferenceNav({ pathname }: { pathname: string }) {
  return (
    <nav className="reference-nav" aria-label={t("shell.navLabel")}>
      {links.map(({ label, href, Icon }) => (
        <a
          key={href}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
        >
          <Icon aria-hidden="true" strokeWidth={1.8} />
          <span>{t(label)}</span>
        </a>
      ))}
    </nav>
  );
}

type PageProps = {
  /** Título de la pantalla (el h1). */
  title: string;
  /** Pantalla a la que se vuelve. Toda pantalla secundaria tiene una salida. */
  back: BackLink;
  /** Pestaña que queda marcada; sin ella la pantalla no lleva barra. */
  tab?: string;
  /** false solo en la propia pantalla de Emergencia. */
  emergency?: boolean;
  /** true: el h1 queda solo para lectores de pantalla. */
  hideTitle?: boolean;
  children: ReactNode;
};

/**
 * Pantalla secundaria con la estructura Marea. La cabecera y la barra quedan
 * fijas y solo se desplaza el contenido, así que Emergencia y la salida
 * siempre están a un toque.
 *
 *   <MareaPage title={t("shell.titles.medKit")} tab="/tareas"
 *     back={{ href: "/tareas", label: t("shell.back.tasks") }}>…</MareaPage>
 */
export function MareaPage({
  title,
  back,
  tab,
  emergency = true,
  hideTitle = false,
  children,
}: PageProps) {
  return (
    <div
      className="reference-app reference-page"
      // En Emergencia no hay transiciones decorativas.
      data-calm={emergency ? undefined : ""}
    >
      <a href="#page-content" className="skip-link">
        {t("shell.skipToContent")}
      </a>
      <ReferenceHeader back={back} emergency={emergency} />
      <main id="page-content" tabIndex={-1} className="reference-content">
        <h1 className={hideTitle ? "sr-only" : undefined}>{title}</h1>
        {children}
      </main>
      {tab && <ReferenceNav pathname={tab} />}
    </div>
  );
}
