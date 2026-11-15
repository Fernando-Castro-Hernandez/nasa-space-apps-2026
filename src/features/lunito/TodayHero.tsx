import { lazy, Suspense, useState, type CSSProperties } from "react";
import { Droplet, Heart, HeartPulse } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { EvolutionPanel } from "@/features/status/EvolutionPanel";
import type { IndicatorView } from "./dashboardData";
import { STATUS_NAME } from "./dashboardData";
import type { Status } from "@/domain/vitals";
import type { Motion } from "./motion";
import { STATUS_VIEW, DASH_VARS } from "./theme";

const LunitoScene = lazy(() =>
  import("./LunitoScene").then((m) => ({ default: m.LunitoScene })),
);
const noAnchors = () => [];
const noop = () => {};
const fill = () => 1.75;
const ICON = { bpm: Heart, hrv: HeartPulse, spo2: Droplet };
const POS = { bpm: [15, 48], hrv: [85, 48], spo2: [50, 85] };
const LABEL = { bpm: "Pulso", hrv: "HRV", spo2: "SpO₂" };

export function TodayHero({
  items,
  status,
  motion,
  highlight,
}: {
  items: IndicatorView[];
  status: Status;
  motion: Motion;
  highlight: IndicatorView["key"] | null;
}) {
  const [selected, setSelected] = useState<IndicatorView | null>(null);
  return (
    <>
      <div className="orbita-stage">
        <div className="orbita-rings" aria-hidden="true" />
        <div className="orbita-model">
          <Suspense
            fallback={<p className="p-8 text-center">Lunito está llegando</p>}
          >
            <LunitoScene
              motion={motion}
              status={status}
              anchorsFor={noAnchors}
              onProject={noop}
              halfWidthFor={fill}
            />
          </Suspense>
        </div>
        {items.map((item) => {
          const Icon = ICON[item.key];
          return (
            <button
              key={item.key}
              type="button"
              className="orbita-moon"
              aria-label={`${item.name}: ${item.value} ${item.unit}. Ver evolución`}
              aria-pressed={
                highlight === item.key || selected?.key === item.key
              }
              onClick={() => setSelected(item)}
              style={
                {
                  left: `${POS[item.key][0]}%`,
                  top: `${POS[item.key][1]}%`,
                  "--moon-color": STATUS_VIEW[item.status].color,
                } as CSSProperties
              }
            >
              <Icon aria-hidden="true" />
              <small>{LABEL[item.key]}</small>
              <strong>{item.value}</strong>
              <small>{item.unit}</small>
              <span className="moon-state">{STATUS_NAME[item.status]}</span>
            </button>
          );
        })}
      </div>
      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent
          side="bottom"
          style={DASH_VARS}
          className="mx-auto max-h-[85dvh] max-w-xl overflow-y-auto rounded-t-3xl p-6"
        >
          <SheetHeader>
            <SheetTitle>{selected?.name}</SheetTitle>
            <SheetDescription>
              Tu evolución personal. Guía de bienestar, no diagnóstico.
            </SheetDescription>
          </SheetHeader>
          {selected && (
            <EvolutionPanel
              items={[selected]}
              status={selected.status}
              looking={null}
              onLook={noop}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
