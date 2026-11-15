// Emergencia a bordo (SISTEMA.md §7.5 y §9.6): la ve el oficial médico.
// Sin nada lúdico: banner rojo, aviso a Tierra con su retraso, checklist,
// dictado y registro del caso con hora.
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { crewMember, MISSION } from "@/data/crew";
import lunitoRojo from "./assets/lunito-rojo.png";
import { closeCase } from "./caseLogic";
import { saveCase, updateCase, useCase, useNow } from "./caseStore";
import { CaseTimeline } from "./CaseTimeline";
import { DictateButton } from "./DictateButton";
import { countdown, formatTime, responseEta } from "./link";
import { OpenCaseForm } from "./OpenCaseForm";
import { ProtocolChecklist } from "./ProtocolChecklist";

export function EmergencyScreen() {
  const c = useCase();
  const now = useNow();
  if (!c) return <OpenCaseForm />;

  const person = crewMember(c.personId);
  const eta = responseEta(c.openedAt, MISSION.delayMinutes);
  const closed = c.closedAt !== undefined;

  return (
    <div className="orbita-emergency flex flex-col">
      <section
        className={`flex flex-wrap items-center gap-4 px-4 py-4 text-white md:px-6 ${
          closed ? "bg-muted-foreground" : "bg-status-alert"
        }`}
      >
        <img src={lunitoRojo} alt="" className="size-14 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-xs font-bold tracking-widest">
            {closed ? "CASO CERRADO" : "EMERGENCIA"} · {formatTime(c.openedAt)}
          </span>
          <span className="text-2xl font-bold">
            {person.name} · {c.what.toLowerCase()}
          </span>
          <span className="text-sm opacity-90">{person.role}</span>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-12 gap-4 p-4 md:gap-6 md:p-6">
        <Card className="col-span-12 border-2 border-status-ok">
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-status-ok">
                Caso enviado a Tierra ✓ · {formatTime(c.openedAt)}
              </p>
              <p className="text-sm text-muted-foreground">
                Retraso de {MISSION.delayMinutes} min por tramo · respuesta
                estimada {formatTime(eta)}
              </p>
            </div>
            <span
              className="font-mono text-3xl font-bold tabular-nums"
              aria-label="Tiempo hasta la respuesta estimada"
            >
              {countdown(eta, now)}
            </span>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-7">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">Protocolo</CardTitle>
            <span className="text-xs font-semibold tracking-wide text-status-warn uppercase">
              Protocolo de ejemplo · pendiente de validar
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ProtocolChecklist c={c} />
            <DictateButton disabled={closed} />
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-lg">Registro del caso</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <CaseTimeline events={c.events} />
            {closed ? (
              <Button
                variant="outline"
                className="h-12 text-base"
                onClick={() => saveCase(null)}
              >
                Nuevo caso
              </Button>
            ) : (
              <Button
                variant="outline"
                className="h-12 text-base"
                onClick={() => updateCase((x) => closeCase(x, Date.now()))}
              >
                Cerrar caso
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
