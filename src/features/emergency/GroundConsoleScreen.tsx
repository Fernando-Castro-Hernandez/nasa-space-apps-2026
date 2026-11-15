// Consola del cirujano de vuelo (SISTEMA.md §9.7): pantalla de escritorio en
// Tierra, sin la barra lateral de la app. Lee el mismo caso que la nave.
import { Radio } from "lucide-react";
import { WeekAreaChart } from "@/components/premium/chart-14/charts-14";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { crewMember, MISSION } from "@/data/crew";
import { HISTORY } from "@/data/history";
import { useCase, useNow } from "./caseStore";
import { CaseTimeline } from "./CaseTimeline";
import { ConsoleSide } from "./ConsoleSide";
import { formatTime } from "./link";
import { ReplyBox } from "./ReplyBox";
import { buildSbar } from "./sbar";
import { SbarCard } from "./SbarCard";

function TopBar() {
  return (
    <header className="orbita-console-top flex flex-wrap items-center justify-between gap-3 border-b bg-card px-6 py-3">
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Radio className="size-4" aria-hidden="true" />
        </span>
        <h1 className="text-base font-semibold">Consola médica · Tierra</h1>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <span
            className="size-2 rounded-full bg-status-ok"
            aria-hidden="true"
          />
          Enlace activo · retraso {MISSION.delayMinutes} min por tramo
        </span>
        <a href="/" className="font-semibold text-primary hover:underline">
          Volver a la nave
        </a>
      </div>
    </header>
  );
}

export function GroundConsoleScreen() {
  const c = useCase();
  const now = useNow();

  if (!c) {
    return (
      <div className="min-h-dvh bg-background">
        <TopBar />
        <div className="mx-auto flex max-w-xl flex-col items-center gap-2 px-6 py-24 text-center">
          <p className="text-lg font-semibold">Sin casos abiertos</p>
          <p className="text-sm text-muted-foreground">
            Cuando la tripulación abra una emergencia en{" "}
            <a href="/emergencia" className="text-primary underline">
              /emergencia
            </a>
            , el caso aparece aquí con su resumen.
          </p>
        </div>
      </div>
    );
  }

  const person = crewMember(c.personId);
  const sbar = buildSbar(c, person.name, [HISTORY.hrv, HISTORY.bpm]);
  const closed = c.closedAt !== undefined;

  return (
    <div className="min-h-dvh bg-background">
      <TopBar />
      <div className="mx-auto flex max-w-[90rem] flex-col gap-6 p-6">
        <section
          className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 p-5 ${
            closed ? "border-border" : "border-status-alert"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold tracking-widest text-status-alert">
              {closed ? "CASO CERRADO" : "EMERGENCIA"} · ABIERTA{" "}
              {formatTime(c.openedAt)} (HORA DE LA NAVE)
            </span>
            <span className="text-2xl font-bold">
              {person.name} · {c.what.toLowerCase()}
            </span>
            <span className="text-sm text-muted-foreground">
              {person.role} · Día {MISSION.day} · {MISSION.phase}
            </span>
          </div>
        </section>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 flex flex-col gap-6 xl:col-span-8">
            <SbarCard sbar={sbar} />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {HISTORY.hrv.label} · últimos 7 días
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WeekAreaChart
                  label={HISTORY.hrv.label}
                  unit={HISTORY.hrv.unit}
                  data={HISTORY.hrv.days}
                  baseline={HISTORY.hrv.baseline}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <ReplyBox disabled={closed} />
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 flex flex-col gap-6 xl:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Línea de tiempo</CardTitle>
              </CardHeader>
              <CardContent>
                <CaseTimeline
                  events={c.events}
                  delayMinutes={MISSION.delayMinutes}
                  now={now}
                />
              </CardContent>
            </Card>
            <ConsoleSide c={c} delayMinutes={MISSION.delayMinutes} now={now} />
          </div>
        </div>
      </div>
    </div>
  );
}
