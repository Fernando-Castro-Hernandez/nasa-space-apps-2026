// Galería de revisión de Lunito en /lunito (herramienta interna, como /demo):
// todas las poses y gestos, el semáforo, la comparación con las imágenes que
// el 3D reemplaza y los canales del rig a mano. No sale en la navegación.
//
// Para capturas automáticas acepta parámetros en la URL:
// ?pose=listening&status=ambar&size=phone&overlay=1&rig=lean:0.1,armLRaise:1
import { useRef, useState, type ReactNode } from "react";
import escucha from "@/features/day-checkin/assets/lunito-escucha.webp";
import pregunta from "@/features/day-checkin/assets/lunito-pregunta.webp";
import saludo from "@/features/day-checkin/assets/lunito-saludo.webp";
import { DASHBOARD_BASELINE, DASHBOARD_READINGS } from "@/data/dashboard";
import type { Status } from "@/domain/vitals";
import { t } from "@/i18n";
import { LUNITO_GESTURES } from "../gestures";
import { LunitoAvatar, type LunitoAvatarHandle } from "../LunitoAvatar";
import { lunitoVoice } from "../lunitoVoice";
import { LUNITO_POSES, type LunitoPose } from "../poses";
import { RigBench } from "./RigBench";

const STATUSES: Status[] = ["verde", "ambar", "rojo"];
const SIZES = { phone: 300, large: 520 } as const;
type Size = keyof typeof SIZES;

/** La imagen que cada pose reemplaza (o la más parecida). */
const FALLBACK: Record<LunitoPose, string> = {
  idle: pregunta,
  greeting: saludo,
  asking: pregunta,
  listening: escucha,
  thinking: pregunta,
  speaking: pregunta,
  celebrating: saludo,
  caring: pregunta,
};

const COMPARE: { image: string; pose: LunitoPose }[] = [
  { image: saludo, pose: "greeting" },
  { image: pregunta, pose: "asking" },
  { image: escucha, pose: "listening" },
];

const param = new URLSearchParams(window.location.search);
const pick = <T extends string>(name: string, options: readonly T[], or: T) =>
  options.find((o) => o === param.get(name)) ?? or;

/** Fondo como las manchas "Marea": el avatar tiene que verse sin caja. */
const STAGE_BACKGROUND =
  "radial-gradient(ellipse 70% 60% at 50% 55%, #c9f1ea 0%, #def6f1 55%, transparent 72%)";

const poseName = (pose: LunitoPose) => t(`lunitoLab.poses.${pose}`);

export default function LunitoLab() {
  const [pose, setPose] = useState(() => pick("pose", LUNITO_POSES, "idle"));
  const [status, setStatus] = useState(() => pick("status", STATUSES, "verde"));
  const [size, setSize] = useState<Size>(() =>
    pick("size", ["phone", "large"], "large"),
  );
  const [withData, setWithData] = useState(false);
  const [overlay, setOverlay] = useState(param.get("overlay") === "1");
  const avatar = useRef<LunitoAvatarHandle>(null);
  const reading = DASHBOARD_READINGS[STATUSES.indexOf(status)]!.reading;

  return (
    <main className="min-h-dvh bg-[#fbf6f2] px-4 py-6 text-[#3b2f5c]">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{t("lunitoLab.title")}</h1>
          <p className="text-[15px]">{t("lunitoLab.intro")}</p>
        </header>

        <section className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <div
            className="shrink-0 rounded-3xl"
            style={{ width: SIZES[size], background: STAGE_BACKGROUND }}
            data-testid="lab-stage"
          >
            <LunitoAvatar
              ref={avatar}
              pose={pose}
              status={status}
              reading={withData ? reading : undefined}
              baseline={withData ? DASHBOARD_BASELINE : undefined}
              fallbackSrc={FALLBACK[pose]}
              label={t("lunitoLab.avatarLabel", { pose: poseName(pose) })}
            />
          </div>
          <div className="flex w-full flex-col gap-5">
            <Choices label={t("lunitoLab.pose")}>
              {LUNITO_POSES.map((p) => (
                <Chip key={p} pressed={p === pose} onClick={() => setPose(p)}>
                  {poseName(p)}
                </Chip>
              ))}
            </Choices>
            <Choices label={t("lunitoLab.gesture")}>
              {LUNITO_GESTURES.map((g) => (
                <Chip key={g} onClick={() => avatar.current?.play(g)}>
                  {t(`lunitoLab.gestures.${g}`)}
                </Chip>
              ))}
            </Choices>
            <Choices label={t("lunitoLab.status")}>
              {STATUSES.map((s) => (
                <Chip
                  key={s}
                  pressed={s === status}
                  onClick={() => setStatus(s)}
                >
                  {t(`common.status.${s}`)}
                </Chip>
              ))}
            </Choices>
            <Choices label={t("lunitoLab.size")}>
              {(["phone", "large"] as const).map((s) => (
                <Chip key={s} pressed={s === size} onClick={() => setSize(s)}>
                  {t(`lunitoLab.sizes.${s}`)}
                </Chip>
              ))}
            </Choices>
            <Check checked={withData} onChange={setWithData}>
              {t("lunitoLab.data")}
            </Check>
            <div>
              <Chip
                onClick={() => void lunitoVoice.say(t("lunitoLab.sampleLine"))}
              >
                {t("lunitoLab.speak")}
              </Chip>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3" data-testid="lab-compare">
          <h2 className="text-xl font-bold">{t("lunitoLab.compare.title")}</h2>
          <p className="text-[15px]">{t("lunitoLab.compare.hint")}</p>
          <Check checked={overlay} onChange={setOverlay}>
            {t("lunitoLab.compare.overlay")}
          </Check>
          <div className="grid gap-6 lg:grid-cols-3">
            {COMPARE.map(({ image, pose: p }) => (
              <figure key={p} className="flex flex-col gap-2">
                <figcaption className="text-[15px] font-bold">
                  {poseName(p)}
                </figcaption>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <img src={image} alt="" className="w-full" />
                    <span className="text-center text-[15px]">
                      {t("lunitoLab.compare.image")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="relative">
                      <LunitoAvatar
                        pose={p}
                        status={status}
                        fallbackSrc={image}
                        label={t("lunitoLab.avatarLabel", {
                          pose: poseName(p),
                        })}
                      />
                      {overlay && (
                        <img
                          src={image}
                          alt=""
                          className="pointer-events-none absolute inset-0 w-full opacity-45"
                        />
                      )}
                    </div>
                    <span className="text-center text-[15px]">
                      {t("lunitoLab.compare.model")}
                    </span>
                  </div>
                </div>
              </figure>
            ))}
          </div>
        </section>

        <RigBench initial={param.get("rig") ?? ""} status={status} />
      </div>
    </main>
  );
}

function Choices({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-[15px] font-bold">{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="min-h-12 rounded-full border border-[#d9cdf3] bg-white px-4 text-[15px] font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] aria-pressed:border-[var(--primary)] aria-pressed:bg-[var(--primary)] aria-pressed:text-white"
    >
      {children}
    </button>
  );
}

function Check({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex min-h-12 items-center gap-3 text-[15px]">
      <input
        type="checkbox"
        className="size-5 accent-[var(--primary)]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {children}
    </label>
  );
}
