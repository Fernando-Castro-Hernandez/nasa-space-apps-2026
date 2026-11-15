// Tripulación (SISTEMA.md §9.4): la constelación de Lunitos, la meta común de
// autonomía, el compañero del día y, solo para el comandante, el panel RIDGE.
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CREW, crewMember } from "@/data/crew";
import { STATUS_TOKEN } from "@/domain/status";
import { useActiveProfile } from "@/features/profiles/activeProfile";
import { AutonomyCard } from "./AutonomyCard";
import { CommanderPanel } from "./CommanderPanel";
import { CompanionCard } from "./CompanionCard";
import { pickCompanion } from "./companion";
import { Constellation } from "./Constellation";
import { PrivacyCard } from "./PrivacyCard";
import { isCommander, publicCrew, publicStatus, useShared } from "./privacy";

export function CrewScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const me = useActiveProfile();
  const shared = useShared();
  const companion = pickCompanion(publicCrew(CREW, shared));
  const picked = selected ? crewMember(selected) : null;
  const pickedStatus = picked && publicStatus(picked, shared);

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4 p-4 md:gap-6 md:p-6">
      <Card className="col-span-12 lg:col-span-7">
        <CardHeader>
          <CardTitle className="text-lg">La constelación</CardTitle>
          <CardDescription>
            Toca un Lunito para ver cómo está. Solo ves cómo están, nunca sus
            datos médicos.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Constellation
            selected={selected}
            onSelect={setSelected}
            pair={companion && [companion.companionId, companion.needsId]}
            shared={shared}
            me={me}
          />
          {picked && (
            <div
              className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4"
              aria-live="polite"
            >
              <div>
                <p className="font-semibold">{picked.name}</p>
                <p className="text-sm text-muted-foreground">{picked.role}</p>
              </div>
              <span
                className="text-sm font-semibold"
                style={{
                  color: pickedStatus ? STATUS_TOKEN[pickedStatus] : undefined,
                }}
              >
                {pickedStatus ? picked.mood : "Sin compartir"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="col-span-12 flex flex-col gap-4 md:gap-6 lg:col-span-5">
        <AutonomyCard />
        {companion && <CompanionCard companion={companion} />}
        <PrivacyCard me={me} />
      </div>

      {isCommander(crewMember(me)) && (
        <div className="col-span-12">
          <CommanderPanel />
        </div>
      )}
    </div>
  );
}
