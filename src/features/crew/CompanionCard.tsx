// Tarjeta del compañero del día (HU-26): solo nombres y una acción simple.
import { useState } from "react";
import { HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { crewMember } from "@/data/crew";
import type { Companion } from "./companion";

export function CompanionCard({ companion }: { companion: Companion }) {
  const [sent, setSent] = useState(false);
  const buddy = crewMember(companion.companionId).name;
  const needs = crewMember(companion.needsId).name;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <HeartHandshake className="size-5 text-primary" aria-hidden="true" />
          Compañero del día
        </CardTitle>
        <CardDescription>
          {buddy} acompaña a {needs} hoy.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm">Propuesta: {companion.action}.</p>
        <Button
          className="h-11 self-start px-5"
          disabled={sent}
          onClick={() => setSent(true)}
        >
          {sent ? "Ánimo enviado" : "Enviar ánimo"}
        </Button>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {sent && `Le llegó tu ánimo a ${needs}. ✓`}
        </p>
      </CardContent>
    </Card>
  );
}
