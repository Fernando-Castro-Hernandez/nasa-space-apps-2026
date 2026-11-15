// Check-in único del día (/buenos-dias, referencia 04). Es una conversación
// de voz a voz: Lunito saluda y pregunta en voz alta, escucha sola (Whisper en
// el Worker; sin IA, el dictado del navegador) y corta al callar, pregunta
// lo que falte (ánimo y estrés), repite lo que entendió y guarda la bitácora.
// "Cambiar algo", o no entender del todo, abre la hoja "Esto entendí" para
// corregir a mano. Después ofrece el sensor y la prueba de reacción (opcionales) y dice el
// resultado del día: el mismo que muestra Inicio. Si algo falla, se escribe y
// se termina igual. "Ahora no" sale en cualquier momento; con la bitácora ya
// guardada, la salida termina el check-in y va a Inicio.
// Si lo que dice la persona suena a emergencia, manda la misma regla que en la
// conversación con Lunito: la hoja y el resultado lo muestran con el acceso a
// Emergencia, Lunito lo dice y no celebra. La bitácora se guarda igual.
import { Check, ChevronLeft, Keyboard, Mic, Square } from "lucide-react";
import { useEffect, useReducer, useRef, useState } from "react";
import { ActiveCaseBanner, EmergencyLink } from "@/components/emergency-access";
import { useLunitoDashboard } from "@/data/lunitoDashboard";
import { ReactionTest } from "@/features/check-in/ReactionTest";
import { ResultView } from "@/features/check-in/ResultView";
import { SensorStep } from "@/features/check-in/SensorStep";
import { useCheckInResult } from "@/features/check-in/useCheckInResult";
import {
  LunitoAvatar,
  type LunitoAvatarHandle,
} from "@/features/lunito/LunitoAvatar";
import { lunitoVoice, useLunitoSpeaking } from "@/features/lunito/lunitoVoice";
import { useVoiceLog } from "@/features/voice/useVoiceLog";
import { VoiceLogSheet } from "@/features/voice/VoiceLogSheet";
import { t } from "@/i18n";
import "@/features/lunito-home/reference.css";
import {
  celebrates,
  DONE_MS,
  GREETING_MS,
  nextPhase,
  PHASE_VIEW,
  READBACK_MS,
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

/** El final de lo dicho, cortado en una palabra: cabe en tres líneas. */
const tail = (text: string, max = 110) =>
  text.length <= max ? text : `…${text.slice(-max).replace(/^\S*\s/, "")}`;

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function DayCheckInScreen({ onDone, onSkip }: Props) {
  const [phase, send] = useReducer(nextPhase, "saludo");
  // La hoja dice "Esto entendí" tras hablar y repite la pregunta al escribir.
  const [answer, setAnswer] = useState<"voice" | "text">("text");
  const [spoken, setSpoken] = useState(false);
  // Lunito terminó de preguntar: toca escuchar. Cada pregunta se escucha una vez.
  const [asked, setAsked] = useState(false);
  const speaking = useLunitoSpeaking();
  const [editing, setEditing] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [reducedMotion] = useState(prefersReducedMotion);
  const lunito = useRef<LunitoAvatarHandle>(null);
  const finish = useRef(onDone);
  useEffect(() => {
    finish.current = onDone;
  });
  const log = useVoiceLog({
    onConfirm: () => send("confirm"),
    converse: true,
  });
  const { voice } = log;
  const day = useLunitoDashboard();
  const result = useCheckInResult(day, log.transcript);
  const urgent = result.emergency !== null;

  // Lunito saluda en voz alta. Antes del primer toque el navegador puede no
  // dejarlo sonar; el saludo ya está escrito en pantalla.
  useEffect(() => {
    const current = { live: true };
    void lunitoVoice.say(t("dayCheckin.greeting.speech")).then(() => {
      if (current.live) setAsked(true);
    });
    return () => {
      current.live = false;
      lunitoVoice.stop();
      lunitoVoice.setThinking(false);
    };
  }, []);

  // Lo que falta (ánimo, estrés) lo pregunta Lunito en voz alta.
  const { followUp, askCount } = log;
  useEffect(() => {
    if (!followUp) return;
    const current = { live: true };
    setAsked(false);
    void lunitoVoice.say(t(`voiceUi.followUp.${followUp}`)).then(() => {
      if (current.live) setAsked(true);
    });
    return () => {
      current.live = false;
    };
    // `askCount` cambia también cuando se repite la misma pregunta.
  }, [followUp, askCount]);

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
    followUp: log.followUp,
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
    setAsked(false);
    setAnswer("voice");
    log.listen();
    send("tapMic");
  };

  // Manos libres: al terminar de preguntar, escucha sin que toquen el micrófono.
  // Si falló (sin permiso, sin palabras), no insiste: ahí sí se toca o se escribe.
  const handsFree = voice.engine !== null && voice.engine !== "none";
  useEffect(() => {
    if (
      (phase === "saludo" || phase === "pregunta") &&
      asked &&
      handsFree &&
      !voice.error
    )
      if (voice.status === "idle") talk();
  });

  // Entendió ánimo y estrés por voz: lo repite y guarda solo. Una emergencia
  // pasa por la hoja, donde se ve el aviso con el acceso a Emergencia.
  const readback =
    phase === "revisar" &&
    answer === "voice" &&
    !editing &&
    !urgent &&
    log.complete &&
    log.organizing !== "working";
  const { confirm } = log;
  const line = t("dayCheckin.readback.line", {
    mood: log.fields.mood ?? "?",
    stress: log.fields.stress ?? "?",
  });
  useEffect(() => {
    if (!readback) return;
    const current = { live: true };
    const dwell = new Promise((resolve) => setTimeout(resolve, READBACK_MS));
    void Promise.all([lunitoVoice.say(line), dwell]).then(() => {
      if (current.live) confirm();
    });
    return () => {
      current.live = false;
      lunitoVoice.stop();
    };
    // `confirm` y `line` cambian en cada render; solo importa entrar a la lectura.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readback]);

  const goHome = () => {
    if (celebrates(result.status, urgent)) lunito.current?.play("cheer");
    setLeaving(true);
  };

  // Con la bitácora guardada, salir ya no pospone nada: el check-in está hecho.
  const saved = log.phase === "saved";
  const exit = phase === "resultado" ? undefined : saved ? onDone : onSkip;
  const talking = TALKING.includes(phase) || (phase === "revisar" && !readback);
  const view = PHASE_VIEW[phase];
  const pose =
    phase === "resultado"
      ? resultPose(result.status, spoken || leaving, urgent)
      : view.pose;
  // Lo que va entendiendo: lo ya dicho y, con el dictado del navegador, lo
  // que está diciendo ahora.
  const heard = tail(`${log.transcript} ${voice.live}`.trim());
  const transcript = heard && (
    <p className="day-transcript">
      <b>{t("dayCheckin.heard")}</b> {heard}
    </p>
  );
  const question = followUp
    ? t(`voiceUi.followUp.${followUp}`)
    : t("dayCheckin.question.title");

  return (
    <div className="day-checkin" data-phase={phase}>
      <div className="day-top">
        <header className="reference-header day-header">
          {exit ? (
            <button type="button" className="reference-back" onClick={exit}>
              <ChevronLeft aria-hidden="true" />
              {saved ? t("dayCheckin.finish") : t("dayCheckin.notNow")}
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
            {readback
              ? t("dayCheckin.readback.title")
              : talking
                ? question
                : phase === "sensor"
                  ? t("checkin.sensor.title")
                  : phase === "reaccion"
                    ? t("checkin.reaction.title")
                    : t("checkin.result.title")}
          </h1>
        )}

        {readback && (
          <>
            <p className="day-caption" aria-live="polite">
              {t("dayCheckin.readback.summary", {
                mood: log.fields.mood ?? "?",
                stress: log.fields.stress ?? "?",
              })}
            </p>
            {transcript}
          </>
        )}

        {talking && (
          <>
            <div className="day-voice-control">
              {phase === "escucha" ? (
                <button
                  key="wave"
                  className="day-wave-button"
                  type="button"
                  aria-hidden="true"
                  tabIndex={-1}
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
                    : speaking
                      ? t("dayCheckin.asking.caption")
                      : t("dayCheckin.question.caption")}
            </p>
            {phase === "escucha" && voice.status === "listening" && (
              <>
                <p className="day-hint">{t("dayCheckin.listening.hint")}</p>
                <button
                  className="day-stop-button"
                  type="button"
                  onClick={voice.stop}
                >
                  <Square aria-hidden="true" />
                  {t("dayCheckin.mic.stop")}
                </button>
              </>
            )}
            {transcript}
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
            <SensorStep
              target={day.reading}
              profileId={day.profile.id}
              onNext={() => send("next")}
            />
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
        {readback && (
          <button
            className="day-write-button"
            type="button"
            onClick={() => setEditing(true)}
          >
            {t("dayCheckin.readback.change")}
          </button>
        )}
      </footer>

      {phase === "revisar" && !readback && (
        <VoiceLogSheet
          log={log}
          title={answer === "voice" ? t("voiceUi.sheet.heard") : question}
          emergency={result.emergency}
          onClose={() => send("close")}
        />
      )}
    </div>
  );
}
