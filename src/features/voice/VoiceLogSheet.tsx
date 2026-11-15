// Hoja "Esto entendí" de la bitácora (HU-08 y HU-09): el texto, que se puede
// corregir, y los campos que ordenó la IA. Es la misma hoja para quien habló
// y para quien prefiere escribir (entonces el texto empieza vacío). Si la IA
// no responde, los campos se llenan a mano; ánimo y estrés son obligatorios.
//
// Es modal (lo de atrás queda inerte), así que lleva su propio botón
// Emergencia, el mismo de la cabecera: siempre a un toque.
import { Sparkles } from "lucide-react";
import { useEffect, useRef, type KeyboardEvent } from "react";
import { LIMITS } from "@/api/contract";
import { EmergencyLink, EmergencyNotice } from "@/components/emergency-access";
import { t } from "@/i18n";
import { FieldsEditor } from "./FieldsEditor";
import type { VoiceLogState } from "./useVoiceLog";
import "./voice.css";

type Props = {
  log: VoiceLogState;
  /** "Esto entendí" tras hablar; la pregunta del día al escribir. */
  title: string;
  /** Si el texto habla de una emergencia, lo que dice Lunito (con el acceso
   *  a Emergencia). La bitácora se puede guardar igual. */
  emergency?: string | null;
  onClose: () => void;
};

const FOCUSABLE =
  "a[href], button:not(:disabled), textarea:not(:disabled), input:not(:disabled)";

/** El foco no sale de la hoja: el diálogo nativo dejaría ir a la barra del navegador. */
function trapTab(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== "Tab") return;
  const controls = event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE);
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}

export function VoiceLogSheet({ log, title, emergency, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  // Al escribir, el teclado se abre solo; tras hablar, se lee primero el título.
  const typing = useRef(log.transcript.trim() === "");

  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element?.showModal();
    // React enfoca antes de showModal; el diálogo nativo volvería al primer botón.
    (typing.current ? field.current : heading.current)?.focus();
    return () => {
      element?.close();
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus();
    };
  }, []);

  const working = log.organizing === "working";
  const hasText = log.transcript.trim().length > 0;

  return (
    <dialog
      ref={dialog}
      aria-labelledby="voice-sheet-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={trapTab}
      className="voice-sheet"
    >
      <div className="voice-sheet-layer">
        <button
          type="button"
          aria-label={t("common.actions.close")}
          onClick={onClose}
          className="voice-sheet-backdrop"
        />
        <form
          className="voice-sheet-panel"
          onSubmit={(event) => {
            event.preventDefault();
            log.confirm();
          }}
        >
          <header className="voice-sheet-head">
            <h2 id="voice-sheet-title" ref={heading} tabIndex={-1}>
              {title}
            </h2>
            <EmergencyLink />
          </header>

          <div className="voice-sheet-body">
            <label className="flex flex-col gap-2">
              <span className="text-base font-extrabold text-foreground">
                {t("voiceUi.sheet.text")}
              </span>
              <textarea
                ref={field}
                value={log.transcript}
                onChange={(event) => log.setTranscript(event.target.value)}
                maxLength={LIMITS.textChars}
                rows={3}
                placeholder={t("voiceUi.sheet.placeholder")}
                className="voice-sheet-text"
              />
            </label>

            {emergency && <EmergencyNotice line={emergency} />}

            {(log.stale || log.organizing === "failed") &&
              hasText &&
              !working && (
                <button
                  type="button"
                  onClick={log.organize}
                  className="voice-sheet-organize"
                >
                  <Sparkles aria-hidden="true" />
                  {t("voiceUi.sheet.organize")}
                </button>
              )}

            <p className="voice-sheet-status" aria-live="polite">
              {working
                ? t("voiceUi.sheet.organizing")
                : log.organizing === "failed"
                  ? t("voiceUi.sheet.failed")
                  : hasText && !log.stale
                    ? t("voiceUi.sheet.understood")
                    : null}
            </p>

            <FieldsEditor
              fields={log.fields}
              onChange={log.setFields}
              disabled={working}
            />
          </div>

          <footer className="voice-sheet-foot">
            {!log.complete && !working && (
              <p className="voice-sheet-hint">{t("voiceUi.sheet.required")}</p>
            )}
            <div className="voice-sheet-actions">
              <button
                type="button"
                onClick={onClose}
                className="voice-sheet-cancel"
              >
                {t("common.actions.cancel")}
              </button>
              <button
                type="submit"
                disabled={!log.complete || working}
                className="voice-sheet-confirm"
              >
                {t("voiceUi.sheet.confirm")}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </dialog>
  );
}
