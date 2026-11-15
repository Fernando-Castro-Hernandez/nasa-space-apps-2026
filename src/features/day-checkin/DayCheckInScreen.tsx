// Check-in único del día (/buenos-dias, referencia 04). Lunito saluda,
// pregunta, escucha de verdad (Whisper en el Worker; sin IA, el dictado del
// navegador), piensa, muestra "Esto entendí" para corregir y guardar la
// bitácora, ofrece el sensor y la prueba de reacción (opcionales) y dice el
// resultado del día: el mismo que muestra Inicio. Si algo falla, se escribe y
// se termina igual. "Ahora no" sale en cualquier momento.
import { Check, ChevronLeft, Keyboard, Mic } from "lucide-react";
import { useEffect, useReducer, useRef, useState } from "react";
import { ActiveCaseBanner, EmergencyLink } from "@/components/emergency-access";
import { useLunitoDashboard } from "@/data/lunitoDashboard";
import { ReactionTest } from "@/features/check-in/ReactionTest";
import { ResultView } from "@/features/check-in/ResultView";
import { SensorStep } from "@/features/check-in/SensorStep";
import { secondsLeft } from "@/features/check-in/simulation";
import { useCheckInResult } from "@/features/check-in/useCheckInResult";
import {
  LunitoAvatar,
  type LunitoAvatarHandle,
} from "@/features/lunito/LunitoAvatar";
import { lunitoVoice } from "@/features/lunito/lunitoVoice";
import { useVoiceLog, VOICE_LOG_SECONDS } from "@/features/voice/useVoiceLog";
import { VoiceLogSheet } from "@/features/voice/VoiceLogSheet";
import { t } from "@/i18n";
import "@/features/lunito-home/reference.css";
import {
  DONE_MS,
  GREETING_MS,
  nextPhase,
  PHASE_VIEW,
  resultImage,
  resultPose,
  TALKING,
  voiceEvent,
} from "./phases";
import { VoiceWave } from "./VoiceWave";
import "./day-checkin.css";

type Props = {
  onDone: () => void;
  /** "Ahora no": pospone el check-in y deja pasar a Inicio. */
  onSkip?: () => void;
};

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function DayCheckInScreen({ onDone, onSkip }: Props) {
  const [phase, send] = useReducer(nextPhase, "saludo");
  // La hoja dice "Esto entendí" tras hablar y repite la pregunta al escribir.
  const [answer, setAnswer] = useState<"voice" | "text">("text");
  const [spoken, setSpoken] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [reducedMotion] = useState(prefersReducedMotion);
  const lunito = useRef<LunitoAvatarHandle>(null);
  const finish = useRef(onDone);
  useEffect(() => {
    finish.current = onDone;
  });
  const log = useVoiceLog({ onConfirm: () => send("confirm") });
  const { voice } = log;
  const day = useLunitoDashboard();
  const result = useCheckInResult(day);

  // Lunito saluda en voz alta. Antes del primer toque el navegador puede no
  // dejarlo sonar; el saludo ya está escrito en pantalla.
  useEffect(() => {
    void lunitoVoice.say(t("dayCheckin.greeting.speech"));
    return () => {
      lunitoVoice.stop();
      lunitoVoice.setThinking(false);
    };
  }, []);

  useEffect(() => {
    if (phase !== "saludo") return;
    const timer = window.setTimeout(() => send("tick"), GREETING_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // La sesión de voz lleva la conversación mientras escucha y piensa.
  const event = voiceEvent(phase, {
    status: voice.status,
    error: voice.error,
    log: log.phase,
    organizing: log.organizing,
  });
  useEffect(() => {
    if (event) send(event);
  }, [event]);

  // Asiente al terminar de escuchar y al guardar; piensa mientras ordena.
  useEffect(() => {
    if (phase === "pensando" || phase === "sensor") lunito.current?.play("nod");
    lunitoVoice.setThinking(phase === "pensando");
  }, [phase]);

  // El resultado: Lunito lo dice y, cuando termina, celebra.
  useEffect(() => {
    if (phase !== "resultado") return;
    const current = { live: true };
    void lunitoVoice.say(result.line).then(() => {
      if (current.live) setSpoken(true);
    });
    return () => {
      current.live = false;
    };
  }, [phase, result.line]);

  // "¡Listo!" un momento y después Inicio.
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => finish.current(), DONE_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  const write = () => {
    // Lo que no terminó de transcribirse se descarta; lo ya escuchado se queda.
    if (voice.status !== "idle") voice.cancel();
    lunitoVoice.stop();
    if (!log.transcript.trim()) setAnswer("text");
    log.write();
    send("write");
  };

  const talk = () => {
    if (voice.engine === "none") return write();
    lunitoVoice.stop();
    setAnswer("voice");
    log.listen();
    send("tapMic");
  };

  const goHome = () => {
    if (result.status !== "rojo") lunito.current?.play("cheer");
    setLeaving(true);
  };

  // Con la bitácora guardada, salir ya no pospone nada: el check-in está hecho.
  const exit =
    phase === "resultado" ? undefined : log.phase === "saved" ? onDone : onSkip;
  const talking = TALKING.includes(phase) || phase === "revisar";
  const view = PHASE_VIEW[phase];
  const pose =
    phase === "resultado"
      ? resultPose(result.status, spoken || leaving)
      : view.pose;
  const question = t("dayCheckin.question.title");

  return (
    <div className="day-checkin" data-phase={phase}>
      <div className="day-top">
        <header className="reference-header day-header">
          {exit ? (
            <button type="button" className="reference-back" onClick={exit}>
              <ChevronLeft aria-hidden="true" />
              {t("dayCheckin.notNow")}
            </button>
          ) : (
            <span />
          )}
          <EmergencyLink className="reference-emergency" />
        </header>
        <ActiveCaseBanner />
      </div>

      <main className="day-main" aria-label={t("dayCheckin.region")}>
        <div className="day-pose" data-size={view.size}>
          <LunitoAvatar
            ref={lunito}
            pose={pose}
            status={phase === "resultado" ? result.status : undefined}
            fallbackSrc={phase === "resultado" ? resultImage(pose) : view.image}
            label={t("dayCheckin.lunito")}
          />
        </div>

        {phase === "saludo" ? (
          <h1 key="saludo">
            <span>{t("dayCheckin.greeting.hello")}</span>{" "}
            <span>{t("dayCheckin.greeting.title")}</span>
          </h1>
        ) : (
          <h1 key={talking ? "pregunta" : phase}>
            {talking
              ? question
              : phase === "sensor"
                ? t("checkin.sensor.title")
                : phase === "reaccion"
                  ? t("checkin.reaction.title")
                  : t("checkin.result.title")}
          </h1>
        )}

        {talking && (
          <>
            <div className="day-voice-control">
              {phase === "escucha" ? (
                <button
                  key="wave"
                  className="day-wave-button"
                  type="button"
                  aria-label={t("dayCheckin.mic.stop")}
                  onClick={voice.stop}
                >
                  <VoiceWave
                    getLevel={voice.level}
                    reducedMotion={reducedMotion}
                  />
                </button>
              ) : phase === "pensando" ? (
                <span key="dots" className="day-thinking" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              ) : (
                <button
                  key="mic"
                  className="day-mic-button"
                  type="button"
                  data-invite={phase === "pregunta" || undefined}
                  aria-label={t("dayCheckin.mic.talk")}
                  onClick={talk}
                >
                  <Mic aria-hidden="true" strokeWidth={1.6} />
                </button>
              )}
            </div>
            <p className="day-caption" aria-live="polite">
              {phase === "saludo"
                ? t("dayCheckin.greeting.caption")
                : phase === "escucha"
                  ? voice.status === "listening"
                    ? t("dayCheckin.listening.caption")
                    : t("dayCheckin.listening.starting")
                  : phase === "pensando"
                    ? voice.status === "transcribing"
                      ? t("dayCheckin.thinking.transcribing")
                      : t("dayCheckin.thinking.organizing")
                    : t("dayCheckin.question.caption")}
            </p>
            {phase === "escucha" && voice.status === "listening" && (
              <p className="day-hint">
                {t("dayCheckin.listening.hint", {
                  seconds: secondsLeft(voice.elapsed, VOICE_LOG_SECONDS),
                })}
              </p>
            )}
            {phase === "pregunta" && voice.error && (
              <p className="day-hint" role="alert">
                {voice.error}
              </p>
            )}
            {voice.engine === "none" && !voice.error && (
              <p className="day-hint">{t("dayCheckin.noVoice")}</p>
            )}
          </>
        )}

        {phase === "sensor" && (
          <>
            <p className="day-saved">
              <Check aria-hidden="true" />
              {t("checkin.saved")}
            </p>
            <p className="day-caption">{t("checkin.sensor.caption")}</p>
            <SensorStep target={day.reading} onNext={() => send("next")} />
          </>
        )}
        {phase === "reaccion" && (
          <>
            <p className="day-caption">{t("checkin.reaction.caption")}</p>
            <ReactionTest onNext={() => send("next")} />
          </>
        )}
        {phase === "resultado" && (
          <ResultView result={result} leaving={leaving} onHome={goHome} />
        )}
      </main>

      <footer className="day-foot">
        {talking && (
          <button className="day-write-button" type="button" onClick={write}>
            <Keyboard aria-hidden="true" strokeWidth={1.75} />
            {t("dayCheckin.write")}
          </button>
        )}
      </footer>

      {phase === "revisar" && (
        <VoiceLogSheet
          log={log}
          title={answer === "voice" ? t("voiceUi.sheet.heard") : question}
          onClose={() => send("close")}
        />
      )}
    </div>
  );
}
