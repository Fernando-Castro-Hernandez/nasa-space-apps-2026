import { useState } from "react";
import {
  Bell,
  CalendarCheck,
  ChevronRight,
  Info,
  Shield,
  SlidersHorizontal,
} from "lucide-react";
import { MISSION, crewMember } from "@/data/crew";
import { PrivacyCard } from "@/features/crew/PrivacyCard";
import lunito from "@/features/day-checkin/assets/lunito-pregunta.webp";
import { ProfilesScreen } from "@/features/profiles/ProfilesScreen";
import { useActiveProfile } from "@/features/profiles/activeProfile";
import { formatDate, t } from "@/i18n";
import { Marea } from "../Marea";
import { ReferenceHeader, ReferenceNav } from "../ReferenceChrome";
import "../reference.css";
import { LanguageSwitch } from "./LanguageSwitch";
import { SettingsRow } from "./SettingsRow";
import "./settings.css";

type Section = "profile" | "privacy";

// Hora del recordatorio diario de la referencia 09 (aún no existe).
const REMINDER = new Date(2026, 0, 1, 9, 0);

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
        <h1>{t("shell.titles.settings")}</h1>
        <div className="settings-profile">
          <Marea variant="hero" />
          <button
            type="button"
            className="settings-profile-button"
            aria-expanded={open === "profile"}
            aria-label={t("settings.profile.change", { name: member.name })}
            onClick={toggle("profile")}
          >
            <img src={lunito} alt="" />
            <span className="settings-row-text">
              <strong>{member.name}</strong>
              <span>
                {t("settings.profile.subtitle", {
                  role: member.role,
                  day: MISSION.day,
                  phase: MISSION.phase,
                })}
              </span>
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
          title={t("settings.lunito.title")}
          subtitle={t("settings.lunito.subtitle")}
          soon
        />
        <LanguageSwitch />

        <h2>{t("settings.privacy.heading")}</h2>
        <SettingsRow
          Icon={Shield}
          title={t("settings.privacy.title")}
          subtitle={t("settings.privacy.subtitle")}
          expanded={open === "privacy"}
          onToggle={toggle("privacy")}
        >
          <PrivacyCard me={me} />
        </SettingsRow>

        <h2>{t("settings.reminders.heading")}</h2>
        <SettingsRow
          Icon={Bell}
          title={t("settings.reminders.notifications")}
          soon
          aside={
            <input
              type="checkbox"
              role="switch"
              className="settings-switch"
              aria-label={t("settings.reminders.notifications")}
              aria-checked={false}
              checked={false}
              disabled
              readOnly
            />
          }
        />
        <SettingsRow
          Icon={CalendarCheck}
          title={t("settings.reminders.daily")}
          value={formatDate(REMINDER, {
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
          })}
          soon
        />

        <h2>{t("settings.links.heading")}</h2>
        <nav className="settings-links" aria-label={t("settings.links.label")}>
          <a href="/tierra">
            {t("settings.links.ground")} <span aria-hidden="true">→</span>
          </a>
          <a href="/demo">
            {t("settings.links.demo")} <span aria-hidden="true">→</span>
          </a>
          <a href="/buenos-dias">
            {t("settings.links.dayStart")} <span aria-hidden="true">→</span>
          </a>
        </nav>

        <section
          className="settings-notices"
          aria-label={t("settings.notices.label")}
        >
          <Info aria-hidden="true" strokeWidth={1.7} />
          <div>
            <p>{t("common.notDiagnosis")}</p>
            <p>{t("settings.notices.simulated")}</p>
          </div>
        </section>
      </main>
      <ReferenceNav pathname="/ajustes" />
    </div>
  );
}
