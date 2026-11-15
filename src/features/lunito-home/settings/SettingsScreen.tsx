import { useState } from "react";
import {
  Bell,
  CalendarCheck,
  ChevronRight,
  Shield,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { MISSION, crewMember } from "@/data/crew";
import { PrivacyCard } from "@/features/crew/PrivacyCard";
import lunito from "@/features/day-checkin/assets/lunito-pregunta.webp";
import { ProfilesScreen } from "@/features/profiles/ProfilesScreen";
import { useActiveProfile } from "@/features/profiles/activeProfile";
import { Marea } from "../Marea";
import { ReferenceHeader, ReferenceNav } from "../ReferenceChrome";
import "../reference.css";
import { SettingsRow } from "./SettingsRow";
import "./settings.css";

type Section = "profile" | "privacy" | "mission";

export function ReferenceSettingsScreen() {
  const me = useActiveProfile();
  const member = crewMember(me);
  const [open, setOpen] = useState<Section | null>(null);
  const toggle = (section: Section) => () =>
    setOpen(open === section ? null : section);

  return (
    <div className="reference-app">
      <ReferenceHeader title="" />
      <main className="settings-page">
        <h1>Configuración</h1>
        <div className="settings-profile">
          <Marea variant="hero" />
          <button
            type="button"
            className="settings-profile-button"
            aria-expanded={open === "profile"}
            aria-label={`Cambiar perfil. Perfil actual: ${member.name}`}
            onClick={toggle("profile")}
          >
            <img src={lunito} alt="" />
            <span className="settings-row-text">
              <strong>{member.name}</strong>
              <span>{member.role} · Misión actual</span>
            </span>
            <ChevronRight aria-hidden="true" className="settings-chevron" />
          </button>
        </div>
        {open === "profile" && (
          <div className="settings-panel">
            <ProfilesScreen />
          </div>
        )}

        <SettingsRow
          Icon={SlidersHorizontal}
          title="Mi Lunito"
          subtitle="Apariencia y estilos"
          soon
        />

        <h2>Privacidad</h2>
        <SettingsRow
          Icon={Shield}
          title="Datos compartidos"
          subtitle="Tu tripulación ve solo tu estado general"
          expanded={open === "privacy"}
          onToggle={toggle("privacy")}
        >
          <PrivacyCard me={me} />
        </SettingsRow>

        <h2>Recordatorios</h2>
        <div className="settings-row">
          <Bell aria-hidden="true" strokeWidth={1.7} />
          <span className="settings-row-text">
            <strong id="settings-notif">Notificaciones</strong>
          </span>
          <span className="settings-soon">Próximamente</span>
          <input
            type="checkbox"
            role="switch"
            className="settings-switch"
            aria-labelledby="settings-notif"
            aria-checked={false}
            checked={false}
            disabled
            readOnly
          />
        </div>
        <SettingsRow
          Icon={CalendarCheck}
          title="Recordatorio diario"
          value="09:00"
          soon
        />

        <SettingsRow
          Icon={Users}
          title="Información de la misión"
          expanded={open === "mission"}
          onToggle={toggle("mission")}
        >
          <p className="settings-mission">
            Día {MISSION.day} · {MISSION.phase}
          </p>
        </SettingsRow>

        <h2>Misión</h2>
        <nav className="settings-links" aria-label="Accesos de la misión">
          <a href="/tierra">
            Consola de Tierra <span aria-hidden="true">→</span>
          </a>
          <a href="/demo">
            Panel de la demo <span aria-hidden="true">→</span>
          </a>
          <a href="/buenos-dias">
            Repetir el inicio del día <span aria-hidden="true">→</span>
          </a>
        </nav>
      </main>
      <ReferenceNav pathname="/ajustes" />
    </div>
  );
}
