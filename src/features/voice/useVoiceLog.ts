// Estado de la bitácora por voz del check-in (HU-08 y HU-09): escuchar o
// escribir, ordenar el texto en campos con la IA y confirmar. Lo comparten la
// conversación del inicio del día (el micrófono) y `VoiceLogSheet` (el texto y
// los campos).
import { useCallback, useRef, useState } from "react";
import { api } from "@/api/client";
import { EMPTY_FIELDS, fieldsComplete } from "@/api/checkinFields";
import type { CheckInFields } from "@/api/contract";
import { detectEmergency } from "@/api/lunitoRules";
import { useActiveProfile } from "@/features/profiles/activeProfile";
import { t } from "@/i18n";
import {
  localFields,
  mergeFields,
  nextFollowUp,
  quickAnswer,
  type FollowUp,
} from "./followUp";
import { useVoiceInput, type VoiceInput } from "./useVoiceInput";
import { saveVoiceLog } from "./voiceLogStore";

/** Duración máxima de la bitácora (SISTEMA.md §4). */
export const VOICE_LOG_SECONDS = 30;

export type ConfirmedLog = { transcript: string; fields: CheckInFields };

type Options = {
  onConfirm?: (log: ConfirmedLog) => void;
  /** Manos libres: corta solo al callar y pregunta lo que falte (ánimo y estrés). */
  converse?: boolean;
};

export type VoiceLogState = {
  voice: VoiceInput;
  /** "ask": falta hablar o escribir · "review": corregir · "saved": listo. */
  phase: "ask" | "review" | "saved";
  /** Lo que Lunito va a preguntar a continuación (solo con `converse`). */
  followUp: FollowUp | null;
  /** Preguntas hechas hasta ahora: cambia aunque se repita la misma pregunta. */
  askCount: number;
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

export function useVoiceLog({
  onConfirm,
  converse = false,
}: Options = {}): VoiceLogState {
  const profile = useActiveProfile();
  const [phase, setPhase] = useState<VoiceLogState["phase"]>("ask");
  const [transcript, setTranscript] = useState("");
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [organizing, setOrganizing] =
    useState<VoiceLogState["organizing"]>("idle");
  const [organized, setOrganized] = useState("");
  const [followUp, setFollowUp] = useState<FollowUp | null>(null);
  const [askCount, setAskCount] = useState(0);
  const asked = useRef(new Map<FollowUp, number>());
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

  // Lo que dijo contestando una pregunta de Lunito se suma a lo anterior.
  const hear = async (text: string) => {
    const answer = text.trim();
    const asking = followUp;
    const full = asking ? `${transcript} ${answer}`.trim() : answer;
    const id = ++request.current;
    setTranscript(full);
    setOrganized(full);
    setOrganizing("working");
    const quick = asking ? quickAnswer(asking, answer) : null;
    const extracted: CheckInFields | null =
      quick ??
      (await api
        .extract(
          asking ? `${t(`voiceUi.followUp.${asking}`)} ${answer}` : answer,
        )
        .catch(() => null));
    if (id !== request.current) return;
    // HU-09: sin IA, los campos se llenan a mano en la hoja. En conversación,
    // Lunito sigue preguntando y entiende lo que puede por palabras clave.
    if (!extracted && !converse) {
      setOrganizing("failed");
      setPhase("review");
      return;
    }
    const merged = mergeFields(
      asking ? fields : EMPTY_FIELDS,
      extracted ?? localFields(answer),
    );
    // Si lo dicho suena a emergencia, Lunito deja de preguntar: la hoja abre
    // ya, con el aviso y el acceso a Emergencia (misma regla que el chat).
    const next =
      converse && !detectEmergency(full)
        ? nextFollowUp(merged, asked.current)
        : null;
    if (next) {
      asked.current.set(next, (asked.current.get(next) ?? 0) + 1);
      setAskCount((n) => n + 1);
    }
    setFields(merged);
    setOrganizing(extracted ? "idle" : "failed");
    setFollowUp(next);
    setPhase(next ? "ask" : "review");
  };

  const voice = useVoiceInput({
    maxSeconds: VOICE_LOG_SECONDS,
    autoStop: converse,
    onText: (text) => void hear(text),
  });

  return {
    voice,
    phase,
    followUp,
    askCount,
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
