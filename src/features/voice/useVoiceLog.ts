// Estado de la bitácora por voz del check-in (HU-08 y HU-09): escuchar o
// escribir, ordenar el texto en campos con la IA y confirmar. Lo comparten la
// conversación del inicio del día (el micrófono) y `VoiceLogSheet` (el texto y
// los campos).
import { useCallback, useRef, useState } from "react";
import { api } from "@/api/client";
import { EMPTY_FIELDS, fieldsComplete } from "@/api/checkinFields";
import type { CheckInFields } from "@/api/contract";
import { useActiveProfile } from "@/features/profiles/activeProfile";
import { useVoiceInput, type VoiceInput } from "./useVoiceInput";
import { saveVoiceLog } from "./voiceLogStore";

/** Duración máxima de la bitácora (SISTEMA.md §4). */
export const VOICE_LOG_SECONDS = 30;

export type ConfirmedLog = { transcript: string; fields: CheckInFields };

type Options = {
  onConfirm?: (log: ConfirmedLog) => void;
};

export type VoiceLogState = {
  voice: VoiceInput;
  /** "ask": falta hablar o escribir · "review": corregir · "saved": listo. */
  phase: "ask" | "review" | "saved";
  transcript: string;
  fields: CheckInFields;
  /** "failed": la IA no pudo; los campos se llenan a mano. */
  organizing: "idle" | "working" | "failed";
  /** El texto cambió desde la última vez que se ordenó. */
  stale: boolean;
  complete: boolean;
  /** Empieza a escuchar; una respuesta anterior queda para corregirse. */
  listen: () => void;
  write: () => void;
  setTranscript: (text: string) => void;
  setFields: (fields: CheckInFields) => void;
  organize: () => void;
  confirm: () => void;
};

export function useVoiceLog({ onConfirm }: Options = {}): VoiceLogState {
  const profile = useActiveProfile();
  const [phase, setPhase] = useState<VoiceLogState["phase"]>("ask");
  const [transcript, setTranscript] = useState("");
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [organizing, setOrganizing] =
    useState<VoiceLogState["organizing"]>("idle");
  const [organized, setOrganized] = useState("");
  // Solo cuenta la última petición: una respuesta vieja no pisa a la nueva.
  const request = useRef(0);

  const organizeText = useCallback(async (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const id = ++request.current;
    setOrganizing("working");
    setOrganized(clean);
    try {
      const extracted = await api.extract(clean);
      if (id !== request.current) return;
      setFields(extracted);
      setOrganizing("idle");
    } catch {
      // HU-09: sin IA, los campos quedan como estén para llenarse a mano.
      if (id === request.current) setOrganizing("failed");
    }
  }, []);

  const voice = useVoiceInput({
    maxSeconds: VOICE_LOG_SECONDS,
    onText: (text) => {
      setTranscript(text);
      setPhase("review");
      void organizeText(text);
    },
  });

  return {
    voice,
    phase,
    transcript,
    fields,
    organizing,
    stale: transcript.trim() !== organized,
    complete: fieldsComplete(fields),
    listen: () => {
      setPhase("ask");
      voice.start();
    },
    write: () => setPhase("review"),
    setTranscript,
    setFields,
    organize: () => void organizeText(transcript),
    confirm: () => {
      if (!fieldsComplete(fields)) return;
      const log = { transcript: transcript.trim(), fields };
      saveVoiceLog(profile, log);
      setPhase("saved");
      onConfirm?.(log);
    },
  };
}
