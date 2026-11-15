// Micrófono redondo (círculos para todo lo de Lunito). Al escuchar, el anillo
// crece con el volumen de la voz; el estado también va en palabras.
import { LoaderCircle, Mic, Square } from "lucide-react";
import { useEffect, useRef } from "react";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";
import type { VoiceInput } from "./useVoiceInput";

type Props = {
  voice: VoiceInput;
  /** Qué se le dice al lector de pantalla cuando está en reposo. */
  label: string;
  /** Diámetro en píxeles. */
  size?: number;
  /** Reemplaza a `voice.start`, por si empezar a escuchar dispara algo más. */
  onStart?: () => void;
  disabled?: boolean;
  className?: string;
};

export function MicButton({
  voice,
  label,
  size = 96,
  onStart,
  disabled = false,
  className,
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const listening = voice.status === "listening";
  const working =
    voice.status === "starting" || voice.status === "transcribing";
  const { level } = voice;

  // El anillo sigue al volumen sin volver a renderizar el componente.
  useEffect(() => {
    const button = ref.current;
    if (!listening || !button) return;
    const frame = { id: 0 };
    const tick = () => {
      button.style.setProperty("--mic-level", level().toFixed(2));
      frame.id = requestAnimationFrame(tick);
    };
    frame.id = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame.id);
      button.style.removeProperty("--mic-level");
    };
  }, [listening, level]);

  const Icon = listening ? Square : working ? LoaderCircle : Mic;

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || working || voice.engine === "none"}
      onClick={listening ? voice.stop : (onStart ?? voice.start)}
      aria-label={listening ? t("voiceUi.mic.stop") : label}
      aria-pressed={listening}
      style={{
        width: size,
        height: size,
        boxShadow: listening
          ? "0 0 0 calc(6px + var(--mic-level, 0) * 22px) color-mix(in oklab, var(--primary) 22%, transparent)"
          : undefined,
      }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_0_8px] shadow-primary/15 transition-[box-shadow,transform] duration-100 hover:bg-primary/85 active:scale-[0.97] disabled:opacity-40",
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        style={{ width: size * 0.36, height: size * 0.36 }}
        className={working ? "motion-safe:animate-spin" : undefined}
      />
    </button>
  );
}
