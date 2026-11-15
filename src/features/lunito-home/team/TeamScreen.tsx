import { useEffect, useRef, useState } from "react";
import { Heart, OctagonAlert } from "lucide-react";
import { CREW, crewMember } from "@/data/crew";
import { useLunitoDashboard } from "@/data/lunitoDashboard";
import { AutonomyCard } from "@/features/crew/AutonomyCard";
import { EncourageButton } from "@/features/crew/EncourageButton";
import { cheerDay, cheersFor, useCheers } from "@/features/crew/encouragement";
import { LoadBalancer } from "@/features/crew/LoadBalancer";
import { isCommander, useShared } from "@/features/crew/privacy";
import lunito from "@/features/day-checkin/assets/lunito-pregunta.webp";
import { useCase } from "@/features/emergency/caseStore";
import { STATUS_VIEW } from "@/features/lunito/theme";
import { useActiveProfile } from "@/features/profiles/activeProfile";
import { t } from "@/i18n";
import { Marea } from "../Marea";
import { ReferenceHeader, ReferenceNav } from "../ReferenceChrome";
import { TeamSheet } from "./TeamSheet";
import { cheersMessage, openEmergency, teamEntries } from "./teamMembers";
import "../reference.css";
import "./team.css";

// Positions inside the scene (% of its box), one per other crew member. Each
// Lunito box is 30% wide and about 40% tall: these slots keep the three tap
// areas apart (no overlap, at least 8 px between them).
const SLOTS = [
  { left: "5%", top: "2%" },
  { left: "64%", top: "17%" },
  { left: "29%", top: "56%" },
];

export function TeamScreen() {
  const me = useActiveProfile();
  const shared = useShared();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const entries = teamEntries(CREW, me, shared);
  const selected = entries.find((entry) => entry.id === selectedId);
  // The same buddy of the day that Home shows (one source of data).
  const buddy = useLunitoDashboard().mission.companion;
  const emergency = openEmergency(useCase());
  const [today] = useState(() => cheerDay(new Date()));
  // Ids saved by another version of the app may no longer be in the crew.
  const cheers = cheersMessage(
    cheersFor(useCheers(), me, today).flatMap(
      (id) => CREW.find((member) => member.id === id)?.name ?? [],
    ),
  );

  // Closing the sheet hands focus back to the Lunito that opened it, so the
  // keyboard never lands on an empty page.
  const lunitos = useRef(new Map<string, HTMLButtonElement>());
  const closeSheet = () => {
    if (selectedId) lunitos.current.get(selectedId)?.focus();
    setSelectedId(null);
  };

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      lunitos.current.get(selectedId)?.focus();
      setSelectedId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedId]);

  return (
    <div className="reference-app">
      <ReferenceHeader title={t("team.title")} />
      <main className="team-page">
        <section className="team-content" aria-labelledby="team-heading">
          <h1 id="team-heading">{t("team.heading")}</h1>
          <p className="team-hint">{t("team.hint")}</p>
          {cheers && (
            <p className="team-cheers">
              <Heart aria-hidden="true" />
              {cheers}
            </p>
          )}
          <div className="team-scene">
            <Marea />
            {entries.map((entry, index) => {
              const inEmergency = emergency?.personId === entry.id;
              return (
                <button
                  key={entry.id}
                  ref={(button) => {
                    if (button) lunitos.current.set(entry.id, button);
                    else lunitos.current.delete(entry.id);
                  }}
                  className="team-lunito"
                  style={SLOTS[index % SLOTS.length]}
                  aria-label={t("team.view", { name: entry.name })}
                  aria-describedby={
                    inEmergency ? `team-emergency-${entry.id}` : undefined
                  }
                  aria-pressed={entry.id === selectedId}
                  data-emergency={inEmergency || undefined}
                  onClick={() => setSelectedId(entry.id)}
                >
                  <img
                    src={
                      entry.status && entry.status !== "verde"
                        ? STATUS_VIEW[entry.status].image
                        : lunito
                    }
                    alt=""
                    data-unshared={entry.status ? undefined : ""}
                  />
                  <span className="team-lunito-name">{entry.name}</span>
                  {inEmergency && (
                    <span
                      className="team-lunito-badge"
                      id={`team-emergency-${entry.id}`}
                    >
                      <OctagonAlert aria-hidden="true" />
                      {t("team.emergency.badge")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {selected ? (
            <TeamSheet
              entry={selected}
              emergencySince={
                emergency?.personId === selected.id ? emergency.since : null
              }
              onClose={closeSheet}
            />
          ) : (
            // With a case open, the header's red strip already leads to it
            // and nothing playful competes with it here.
            !emergency &&
            buddy && (
              <div className="team-companion">
                <p>
                  {t("team.buddy")} · <strong>{buddy.name}</strong>
                </p>
                <EncourageButton toId={buddy.id} className="team-cheer" />
              </div>
            )
          )}
        </section>
        {/* HU-17/HU-30: shared autonomy goal; HU-27: balancer, commander only. */}
        <section className="team-mission" aria-label={t("team.missionLabel")}>
          <AutonomyCard />
          {isCommander(crewMember(me)) && <LoadBalancer />}
        </section>
      </main>
      <ReferenceNav pathname="/tripulacion" />
    </div>
  );
}
