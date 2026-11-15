import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { CREW, crewMember } from "@/data/crew";
import { pickCompanion } from "@/features/crew/companion";
import { AutonomyCard } from "@/features/crew/AutonomyCard";
import { LoadBalancer } from "@/features/crew/LoadBalancer";
import { isCommander, useShared } from "@/features/crew/privacy";
import lunito from "@/features/day-checkin/assets/lunito-pregunta.webp";
import { STATUS_VIEW } from "@/features/lunito/theme";
import { useActiveProfile } from "@/features/profiles/activeProfile";
import { Marea } from "../Marea";
import { ReferenceHeader, ReferenceNav } from "../ReferenceChrome";
import { NO_BACKEND, TeamSheet } from "./TeamSheet";
import { teamEntries } from "./teamMembers";
import "../reference.css";
import "./team.css";

// Positions inside the scene (% of its box), one per other crew member.
const SLOTS = [
  { left: "6%", top: "2%" },
  { left: "58%", top: "20%" },
  { left: "30%", top: "58%" },
];

const companion = pickCompanion(CREW);

export function TeamScreen() {
  const me = useActiveProfile();
  const shared = useShared();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const entries = teamEntries(CREW, me, shared);
  const selected = entries.find((entry) => entry.id === selectedId);

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedId]);

  return (
    <div className="reference-app">
      <ReferenceHeader title="Equipo" />
      <main className="team-page">
        <section className="team-content" aria-labelledby="team-heading">
          <h1 id="team-heading">Tu tripulación</h1>
          <p className="team-hint">Toca un Lunito para ver cómo está</p>
          <div className="team-scene">
            <Marea />
            {entries.map((entry, index) => (
              <button
                key={entry.id}
                className="team-lunito"
                style={SLOTS[index % SLOTS.length]}
                aria-label={`Ver a ${entry.name}`}
                aria-pressed={entry.id === selectedId}
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
                <span>{entry.name}</span>
              </button>
            ))}
          </div>
          {selected ? (
            <TeamSheet entry={selected} onClose={() => setSelectedId(null)} />
          ) : (
            companion && (
              <div className="team-companion">
                <p>
                  Compañero de hoy ·{" "}
                  <strong>{crewMember(companion.companionId).name}</strong>
                </p>
                <button className="team-cheer" disabled title={NO_BACKEND}>
                  <Heart aria-hidden="true" />
                  Enviar ánimo
                </button>
              </div>
            )
          )}
        </section>
        {/* HU-17/HU-30: shared autonomy goal; HU-27: balancer, commander only. */}
        <section className="team-mission" aria-label="Misión de la tripulación">
          <AutonomyCard />
          {isCommander(crewMember(me)) && <LoadBalancer />}
        </section>
      </main>
      <ReferenceNav pathname="/tripulacion" />
    </div>
  );
}
