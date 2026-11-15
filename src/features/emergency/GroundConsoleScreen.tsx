// Consola del cirujano de vuelo (SISTEMA.md §9.7): pantalla de escritorio en
// Tierra, sin la estructura de la app. Es otra persona y en otro lugar: se
// queda con su barra oscura de consola. Lee el mismo caso que la nave.
import { ChevronLeft, Radio } from "lucide-react";
import { WeekAreaChart } from "@/components/premium/chart-14/charts-14";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { crewMember, MISSION } from "@/data/crew";
import { HISTORY } from "@/data/history";
import { t } from "@/i18n";
import { whatLabel } from "./caseLogic";
import { useCase, useNow } from "./caseStore";
import { CaseTimeline } from "./CaseTimeline";
import { ConsoleSide } from "./ConsoleSide";
import { formatTime } from "./link";
import { ReplyBox } from "./ReplyBox";
import { buildSbar } from "./sbar";
import { SbarCard } from "./SbarCard";
import { withWeekdays } from "./weekDays";
import "./emergency.css";

function TopBar() {
  return (
    <header className="ground-top">
      <h1>
        <span>
          <Radio aria-hidden="true" />
        </span>
        {t("ground.title")}
      </h1>
      <div className="ground-top-info">
        <span>
          <span className="ground-led" aria-hidden="true" />
          {t("ground.linkActive", { minutes: MISSION.delayMinutes })}
        </span>
        <span className="ground-simulated">{t("ground.simulated")}</span>
        <a href="/" className="ground-back">
          <ChevronLeft aria-hidden="true" />
          {t("ground.back")}
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
      <div className="ground-console">
        <TopBar />
        <main className="mx-auto flex max-w-xl flex-col items-center gap-2 px-6 py-24 text-center">
          <h2 className="text-xl font-bold">{t("ground.empty.title")}</h2>
          <p className="text-base text-muted-foreground">
            {t("ground.empty.body")}
          </p>
        </main>
      </div>
    );
  }

  const person = crewMember(c.personId);
  // El nombre del glosario para la HRV, igual en el resumen y en la gráfica.
  const hrv = { ...HISTORY.hrv, label: t("ground.hrv") };
  const sbar = buildSbar(c, person.name, [hrv, HISTORY.bpm]);
  const closed = c.closedAt !== undefined;
  const opened = formatTime(c.openedAt);

  return (
    <div className="ground-console">
      <TopBar />
      <main className="mx-auto flex max-w-[90rem] flex-col gap-6 p-4 md:p-6">
        <section
          className={`flex flex-col gap-1 rounded-2xl border-2 bg-card p-5 ${
            closed ? "border-border" : "border-status-alert"
          }`}
        >
          <p
            className={`ground-eyebrow ${closed ? "text-muted-foreground" : "text-status-alert"}`}
          >
            {closed
              ? t("ground.case.closed", { time: opened })
              : t("ground.case.open", { time: opened })}
          </p>
          <h2 className="text-[28px] leading-tight font-extrabold">
            {t("emergency.banner.headline", {
              name: person.name,
              what: whatLabel(c.what),
            })}
          </h2>
          <p className="text-base text-muted-foreground">
            {t("ground.case.context", {
              role: person.role,
              day: MISSION.day,
              phase: MISSION.phase,
            })}
          </p>
        </section>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 flex flex-col gap-6 xl:col-span-8">
            <SbarCard sbar={sbar} />
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  {t("ground.hrvChart")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WeekAreaChart
                  label={hrv.label}
                  unit={hrv.unit}
                  data={withWeekdays(hrv.days)}
                  baseline={hrv.baseline}
                />
              </CardContent>
            </Card>
            {!closed && (
              <Card>
                <CardContent>
                  <ReplyBox />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="col-span-12 flex flex-col gap-6 xl:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  {t("ground.timeline")}
                </CardTitle>
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
      </main>
    </div>
  );
}
