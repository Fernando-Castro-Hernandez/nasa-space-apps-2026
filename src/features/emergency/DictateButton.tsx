// Dictar una nota (SISTEMA.md §7.5, paso 4): un toque empieza a escuchar y
// otro la guarda en el registro con su hora ("le di oxígeno a las 14:05").
// No hay que mantener presionado: flotando y sujetando a alguien, el dedo se
// desliza. Se guarda sola a los 30 s. Si la voz falla, o si este navegador no
// puede escuchar, la nota se escribe: el registro es la fuente para Tierra y
// nunca guarda algo que nadie dijo.
import { Mic } from "lucide-react";
import { type CSSProperties, useState } from "react";
import { useVoiceInput } from "@/features/voice/useVoiceInput";
import { t } from "@/i18n";
import { addNote } from "./caseLogic";
import { updateCase } from "./caseStore";

/** Una nota de emergencia es corta; el caso no puede esperar. */
const NOTE_SECONDS = 30;

const record = (said: string) =>
  updateCase((c) => addNote(c, Date.now(), said));

export function DictateButton() {
  const voice = useVoiceInput({ maxSeconds: NOTE_SECONDS, onText: record });
  const [typed, setTyped] = useState("");
  // Sin micrófono ni dictado en este navegador, solo queda escribir.
  const canListen = voice.engine !== "none";
  const listening = voice.status === "starting" || voice.status === "listening";
  const saving = voice.status === "transcribing";
  const progress = listening ? Math.min(1, voice.elapsed / NOTE_SECONDS) : 0;

  return (
    <div className="flex flex-col gap-2">
      {canListen && (
        <>
          <button
            type="button"
            data-dictate
            disabled={saving}
            onClick={listening ? voice.stop : voice.start}
            data-listening={listening || undefined}
            className="em-dictate em-tap"
          >
            <Mic aria-hidden="true" />
            {saving
              ? t("emergency.dictate.saving")
              : listening
                ? t("emergency.dictate.listening")
                : t("emergency.dictate.start")}
            {listening && (
              <span
                className="em-dictate-progress"
                style={{ "--progress": progress } as CSSProperties}
                aria-hidden="true"
              />
            )}
          </button>
          <p className="em-hint" aria-live="polite">
            {listening
              ? t("emergency.dictate.autoStop", { seconds: NOTE_SECONDS })
              : ""}
          </p>
        </>
      )}
      {(!canListen || voice.error) && (
        <form
          className="em-typed"
          onSubmit={(e) => {
            e.preventDefault();
            if (!typed.trim()) return;
            record(typed);
            setTyped("");
          }}
        >
          {voice.error && (
            <p role="alert">
              {voice.error} {t("emergency.dictate.typeInstead")}
            </p>
          )}
          <div>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              maxLength={200}
              aria-label={t("emergency.dictate.noteLabel")}
              placeholder={t("emergency.dictate.placeholder")}
            />
            <button type="submit" disabled={!typed.trim()} className="em-tap">
              {t("common.actions.save")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
