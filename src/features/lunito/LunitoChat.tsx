// Habla con Lunito (SISTEMA.md §1): él habla primero con tu estado del día, y
// tú le respondes con la voz o escribiendo. Su respuesta siempre queda en
// texto y además la dice en voz alta, con la boca del modelo 3D.
// Lunito acompaña y guía a lo que ya existe (check-in, tareas, Emergencia);
// no diagnostica: lo que dice sale de las reglas, no de la IA.
import { SendHorizontal, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { LIMITS, type LunitoContext } from "@/api/contract";
import { DAY_ACTIONS } from "@/data/actions";
import { CREW, crewMember, MISSION } from "@/data/crew";
import type { Status } from "@/domain/vitals";
import { useDailyActions } from "@/features/medicine/actionStore";
import { useActiveProfile } from "@/features/profiles/activeProfile";
import { MicButton } from "@/features/voice/MicButton";
import { useVoiceInput } from "@/features/voice/useVoiceInput";
import { useTodayVoiceLog } from "@/features/voice/voiceLogStore";
import { t } from "@/i18n";
import { lunitoVoice, useLunitoMuted } from "./lunitoVoice";
import { useLunitoTalk } from "./useLunitoTalk";

/** Segundos máximos de un mensaje de voz para Lunito. */
const MESSAGE_SECONDS = 20;

type Props = {
  /** Estado y motivo que ya calcularon las reglas: los mismos que muestra
   *  la pantalla (useLunitoDashboard). */
  status: Status;
  reason: string | null;
  /** Dice en voz alta su saludo al abrirse (se abrió con un toque). */
  speakFirst?: boolean;
};

/** Junta lo que las reglas ya saben de la persona hoy. */
function useLunitoContext({ status, reason }: Props): LunitoContext {
  const profile = useActiveProfile();
  const name = crewMember(profile).name;
  const cmoName =
    CREW.find((c) => c.role.includes("CMO"))?.name ??
    t("lunito.chat.cmoFallback");
  const actions = useDailyActions();
  const checkInDone = useTodayVoiceLog(profile) !== null;
  // Como texto, para que el contexto solo cambie cuando cambian las tareas.
  const pending = DAY_ACTIONS.filter((a) => !actions.checked(a.id))
    .map((a) => a.text)
    .join("\n");
  // El estado viaja como código; cada lado lo dice en su idioma.
  return useMemo(
    () => ({
      name,
      status,
      // Las reglas la dicen como frase (lunitoRules.stateLine).
      reason,
      pendingActions: pending ? pending.split("\n") : [],
      checkInDone,
      missionDay: MISSION.day,
      cmoName,
    }),
    [name, status, reason, pending, checkInDone, cmoName],
  );
}

export function LunitoChat({ speakFirst = false, ...props }: Props) {
  const context = useLunitoContext(props);
  const talk = useLunitoTalk(context);
  const muted = useLunitoMuted();
  const [draft, setDraft] = useState("");
  const voice = useVoiceInput({
    maxSeconds: MESSAGE_SECONDS,
    onText: talk.ask,
  });
  const listening = voice.status === "listening";

  // Solo el saludo con el que se abrió, una vez.
  const [greeting] = useState(talk.line);
  useEffect(() => {
    if (speakFirst) void lunitoVoice.say(greeting);
  }, [speakFirst, greeting]);

  const send = (event: FormEvent) => {
    event.preventDefault();
    talk.ask(draft);
    setDraft("");
  };

  return (
    <section
      aria-label={t("lunito.chat.region")}
      className="mx-auto flex w-full max-w-md flex-col gap-3"
    >
      {talk.heard && (
        <p className="max-w-[85%] self-end truncate rounded-3xl rounded-br-md bg-accent px-4 py-2 text-[15px] text-foreground">
          {t("lunito.chat.you", { message: talk.heard })}
        </p>
      )}
      <p
        className="rounded-3xl rounded-tl-md bg-muted px-5 py-3 text-lg leading-snug font-bold text-balance text-foreground"
        aria-live="polite"
      >
        {talk.thinking ? t("lunito.chat.thinking") : talk.line}
      </p>

      {talk.suggest === "emergencia" && (
        <a
          href="/emergencia"
          className="flex min-h-12 items-center justify-center self-center rounded-full bg-[var(--reference-emergency)] px-6 font-extrabold text-white"
        >
          {t("lunito.chat.openEmergency")}
        </a>
      )}
      {talk.suggest === "check-in" && (
        <a
          href="/buenos-dias"
          className="flex min-h-12 items-center justify-center self-center rounded-full border-2 border-primary px-6 text-base font-extrabold text-primary"
        >
          {t("lunito.chat.doCheckIn")}
        </a>
      )}

      <form onSubmit={send} className="mt-1 flex w-full items-center gap-2">
        <MicButton
          voice={voice}
          size={52}
          label={t("lunito.chat.mic")}
          disabled={talk.thinking}
          className="shadow-none"
        />
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={LIMITS.messageChars}
          disabled={listening}
          aria-label={t("lunito.chat.input")}
          placeholder={
            listening ? t("lunito.chat.listening") : t("lunito.chat.input")
          }
          className="h-12 min-w-0 flex-1 rounded-full border border-border bg-card px-4 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <button
          type="submit"
          disabled={!draft.trim() || talk.thinking}
          aria-label={t("lunito.chat.send")}
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95 disabled:opacity-40"
        >
          <SendHorizontal className="size-5" aria-hidden="true" />
        </button>
      </form>
      {voice.error && (
        <p role="alert" className="text-center text-[15px] font-semibold">
          {voice.error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-x-2 text-[15px]">
        <button
          type="button"
          onClick={talk.repeat}
          disabled={muted || talk.thinking}
          className="flex min-h-12 items-center gap-2 rounded-full px-4 font-bold text-primary disabled:opacity-40"
        >
          <Volume2 className="size-5" aria-hidden="true" />
          {talk.speaking ? t("lunito.chat.speaking") : t("lunito.chat.listen")}
        </button>
        <button
          type="button"
          onClick={() => lunitoVoice.setMuted(!muted)}
          aria-pressed={muted}
          className="flex min-h-12 items-center gap-2 rounded-full px-4 font-semibold text-muted-foreground"
        >
          <VolumeX className="size-5" aria-hidden="true" />
          {muted ? t("lunito.chat.voiceOff") : t("lunito.chat.turnVoiceOff")}
        </button>
      </div>
      <p className="text-center text-[15px] text-muted-foreground">
        {t("lunito.chat.disclaimer")}
      </p>
    </section>
  );
}
