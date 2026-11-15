// Banco del rig: Lunito sin director, con cada canal en un control. Sirve
// para encontrar hasta dónde gira cada parte antes de que se vea el corte de
// los brazos o algo atraviese el cuerpo, y así diseñar las poses.
import { Canvas } from "@react-three/fiber";
import { Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Status } from "@/domain/vitals";
import { t } from "@/i18n";
import type { LunitoAnimator } from "../animator";
import { CAMERA } from "../framing";
import {
  ContactShadow,
  Framing,
  Lights,
  prepareRenderer,
} from "../LunitoAvatarCanvas";
import { hasWebGL } from "../webgl";
import { LunitoGlb } from "../LunitoGlb";
import { calmMotion } from "../motion";
import {
  copyRig,
  neutralRig,
  RIG_CHANNELS,
  type Rig,
  type RigChannel,
} from "../rig";

/** Energía y ritmo solo cambian la vida de fondo, que el banco no tiene. */
const SHOWN = RIG_CHANNELS.filter((c) => c !== "energy" && c !== "tempo");

/** Rango de cada control: giros en radianes, distancias y formas. */
function rangeOf(c: RigChannel): [number, number] {
  if (c === "lift" || c === "stretch") return [-0.3, 0.3];
  if (c === "lookX" || c === "lookY") return [-1, 1];
  if (
    ["blink", "happy", "wide", "smile", "pucker", "open", "oh"].includes(c) ||
    c === "gillWave"
  )
    return [0, 1];
  return [-1.6, 1.6];
}

/** "lean:0.1,armLRaise:1" → canales. */
function parseRig(text: string): Rig {
  const rig = neutralRig();
  for (const pair of text.split(",")) {
    const [name, value] = pair.split(":");
    if (RIG_CHANNELS.includes(name as RigChannel) && value !== undefined)
      rig[name as RigChannel] = Number(value) || 0;
  }
  return rig;
}

export function RigBench({
  initial,
  status,
}: {
  initial: string;
  status: Status;
}) {
  const [rig, setRig] = useState(() => parseRig(initial));
  const current = useRef(rig);
  useLayoutEffect(() => {
    current.current = rig;
  });
  const director = useMemo(() => {
    const manual: LunitoAnimator = {
      phase: 0,
      play: () => {},
      step: (_dt, _input, out) => copyRig(current.current, out),
    };
    return {
      animator: manual,
      input: () => ({
        pose: "idle" as const,
        pointer: null,
        still: true,
        followVoice: false,
      }),
    };
  }, []);
  const motion = useMemo(() => calmMotion(true), []);
  // Sin WebGL no hay modelo que mover.
  if (!hasWebGL()) return null;

  return (
    <section className="flex flex-col gap-3" data-testid="lab-rig">
      <h2 className="text-xl font-bold">{t("lunitoLab.rig.title")}</h2>
      <p className="text-[15px]">{t("lunitoLab.rig.hint")}</p>
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="relative aspect-square w-full max-w-[420px] shrink-0">
          <Canvas
            aria-hidden="true"
            dpr={[1, 2]}
            gl={{ alpha: true }}
            camera={{ fov: CAMERA.fov }}
            onCreated={({ gl }) => prepareRenderer(gl)}
          >
            <Framing bleed={0} />
            <Lights />
            <Suspense fallback={null}>
              <LunitoGlb
                motion={motion}
                status={status}
                director={director}
                scale={1}
                offsetY={0}
              />
              <ContactShadow />
            </Suspense>
          </Canvas>
        </div>
        <div className="grid w-full gap-x-6 gap-y-1 sm:grid-cols-2">
          {SHOWN.map((c) => {
            const [min, max] = rangeOf(c);
            return (
              <label key={c} className="flex min-h-12 items-center gap-3">
                <code className="w-24 shrink-0 text-[15px]">{c}</code>
                <input
                  type="range"
                  name={c}
                  className="w-full accent-[var(--primary)]"
                  min={min}
                  max={max}
                  step={0.01}
                  value={rig[c]}
                  onChange={(e) =>
                    setRig({ ...rig, [c]: Number(e.target.value) })
                  }
                />
                <output className="w-12 text-right text-[15px] tabular-nums">
                  {rig[c].toFixed(2)}
                </output>
              </label>
            );
          })}
          <div>
            <button
              type="button"
              onClick={() => setRig(neutralRig())}
              className="min-h-12 rounded-full border border-[#d9cdf3] bg-white px-4 text-[15px] font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              {t("lunitoLab.rig.reset")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
