// Panel oculto de la demo (HU-28): dispara cada paso de SISTEMA.md §11 con un
// botón. No sale en la barra; se abre desde Configuración o a mano en /demo.
import { useState } from "react";
import { Check, ChevronRight, Siren } from "lucide-react";
import { casePersonName, useActiveCase } from "@/app/activeCase";
import { Button } from "@/components/ui/button";
import { crewMember } from "@/data/crew";
import { DASHBOARD_READINGS } from "@/data/dashboard";
import { openCase, WHAT_HAPPENED } from "@/features/emergency/caseLogic";
import { saveCase } from "@/features/emergency/caseStore";
import { useActiveProfile } from "@/features/profiles/activeProfile";
import {
  clearSensorReading,
  useSensorReading,
} from "@/features/sensor/sensorReadingStore";
import { formatNumber, t, type MessageKey } from "@/i18n";
import { setCo2State, useCo2State, type Co2State } from "./demoStore";
import { setReadingIndex, useReadingIndex } from "./readingStore";
import { resetDemo } from "./resetDemo";

const CO2_LABEL: Record<Co2State, MessageKey> = {
  normal: "demo.co2.raise",
  alto: "demo.co2.high",
  resuelto: "demo.co2.solved",
};

// Un botón de la demo: alto si el texto pide dos líneas, nunca cortado.
const action =
  "h-auto min-h-12 justify-start px-4 py-3 text-left text-base whitespace-normal";

// Lo que muestra el paso 4 de la demo: Ana se desmaya (SISTEMA.md §11).
function simulateEmergency() {
  const ana = crewMember("ana");
  saveCase(openCase(ana.id, ana.name, WHAT_HAPPENED[0], Date.now()));
}

const appEnv = import.meta.env.VITE_APP_ENV ?? "local";
const commit = import.meta.env.VITE_COMMIT_SHA?.slice(0, 7) ?? "dev";

export function DemoScreen() {
  const co2 = useCo2State();
  const reading = useReadingIndex();
  const profile = useActiveProfile();
  const sensorReading = useSensorReading(profile);
  const activeCase = useActiveCase();
  const [reset, setReset] = useState<"idle" | "confirm" | "done">("idle");

  return (
    // Misma columna que el título de la página (MareaPage), a la izquierda.
    <div className="mx-auto flex w-full max-w-[920px] flex-col gap-5 px-5 pb-6 *:max-w-2xl">
      <p className="text-base text-muted-foreground">{t("demo.intro")}</p>

      <Button
        className={action}
        disabled={co2 === "resuelto"}
        onClick={() => setCo2State(co2 === "normal" ? "alto" : "resuelto")}
      >
        {t(CO2_LABEL[co2])}
      </Button>

      <div className="flex flex-col gap-2">
        <Button className={action} onClick={simulateEmergency}>
          {t("demo.emergency.simulate", { name: crewMember("ana").name })}
        </Button>
        <output className="block">
          {activeCase && (
            <span className="flex flex-wrap items-center gap-x-6 gap-y-2 text-base">
              <span className="flex w-full items-center gap-2 font-bold text-status-alert">
                <Siren aria-hidden="true" className="size-5" />
                {t("demo.emergency.opened", {
                  name: casePersonName(activeCase),
                })}
              </span>
              <a
                href="/emergencia"
                className="inline-flex min-h-12 items-center font-bold text-primary underline underline-offset-4"
              >
                {t("demo.emergency.viewShip")}
              </a>
              <a
                href="/tierra"
                className="inline-flex min-h-12 items-center font-bold text-primary underline underline-offset-4"
              >
                {t("demo.emergency.viewGround")}
              </a>
            </span>
          )}
        </output>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-base font-bold">
          {t("demo.reading")}
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {DASHBOARD_READINGS.map((r, i) => (
            <Button
              key={i}
              variant={i === reading ? "default" : "outline"}
              aria-pressed={i === reading}
              className="h-auto min-h-12 text-base whitespace-normal"
              onClick={() => setReadingIndex(i)}
            >
              {i === reading && <Check aria-hidden="true" />}
              {r.name}
            </Button>
          ))}
        </div>
        {sensorReading && (
          <div className="mt-2 flex flex-col items-start gap-2">
            <p className="text-base text-muted-foreground">
              {t("demo.sensor.using", {
                name: crewMember(profile).name,
                bpm: formatNumber(sensorReading.bpm),
                spo2: formatNumber(sensorReading.spo2),
                first: DASHBOARD_READINGS[0]!.name,
              })}
            </p>
            <Button
              variant="outline"
              className="min-h-12 px-5 text-base"
              onClick={() => clearSensorReading(profile)}
            >
              {t("demo.sensor.discard")}
            </Button>
          </div>
        )}
      </fieldset>

      <div className="flex flex-col gap-2">
        {reset === "confirm" ? (
          <div className="flex flex-col gap-3 rounded-3xl bg-card p-4 shadow-[0_6px_16px_var(--reference-shadow)]">
            <p className="text-base">{t("demo.reset.confirm")}</p>
            <div className="flex flex-wrap gap-3">
              <Button
                className="min-h-12 px-5 text-base"
                onClick={() => {
                  resetDemo();
                  setReset("done");
                }}
              >
                {t("demo.reset.yes")}
              </Button>
              <Button
                variant="outline"
                className="min-h-12 px-5 text-base"
                onClick={() => setReset("idle")}
              >
                {t("common.actions.cancel")}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className={action}
            onClick={() => setReset("confirm")}
          >
            {t("demo.reset.button")}
          </Button>
        )}
        <output className="block text-base font-bold text-status-ok">
          {reset === "done" && (
            <span className="flex items-center gap-2">
              <Check aria-hidden="true" className="size-5" />
              {t("demo.reset.done")}
            </span>
          )}
        </output>
      </div>

      <a
        href="/lunito"
        className="flex min-h-12 items-center justify-between text-base font-bold text-primary"
      >
        {t("demo.lab")}
        <ChevronRight aria-hidden="true" className="size-5" />
      </a>

      <p
        className="text-center text-[15px] text-muted-foreground"
        data-testid="build-info"
      >
        {t("demo.build", { env: appEnv, commit })}
      </p>
    </div>
  );
}
