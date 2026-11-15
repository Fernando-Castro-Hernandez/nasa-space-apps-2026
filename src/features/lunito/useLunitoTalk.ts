// Conversación con Lunito: recibe un mensaje (dictado o escrito), responde en
// texto y lo dice en voz alta. Las reglas van primero y al final: una
// emergencia no espera a la red, y sin Worker Lunito responde con lo que ya
// decidieron las reglas (SISTEMA.md §1).
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/api/client";
import {
  LIMITS,
  type LunitoContext,
  type LunitoReplyResponse,
  type LunitoSuggestion,
  type LunitoTurn,
} from "@/api/contract";
import {
  detectEmergency,
  emergencyReply,
  fallbackReply,
  greeting,
} from "@/api/lunitoRules";
import { useLocale } from "@/i18n";
import { lunitoVoice, useLunitoSpeaking } from "./lunitoVoice";

export type LunitoTalk = {
  /** Lo que Lunito dice ahora: su saludo o su última respuesta. */
  line: string;
  /** Lo último que la persona le dijo, para confirmar que se entendió. */
  heard: string | null;
  suggest: LunitoSuggestion;
  thinking: boolean;
  speaking: boolean;
  ask: (message: string) => void;
  /** Dice en voz alta la frase actual. */
  repeat: () => void;
};

export function useLunitoTalk(context: LunitoContext): LunitoTalk {
  const [reply, setReply] = useState<LunitoReplyResponse | null>(null);
  const [heard, setHeard] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  // Tras una emergencia, la invitación a Emergencia se queda el resto de la
  // conversación, aunque la persona siga escribiendo.
  const [emergency, setEmergency] = useState(false);
  const speaking = useLunitoSpeaking();
  const history = useRef<LunitoTurn[]>([]);
  const busy = useRef(false);
  // La respuesta puede llegar con la conversación ya cerrada (se fue a
  // Emergencia, cerró la hoja o cambió de idioma): entonces Lunito calla.
  const alive = useRef(true);

  // Al salir de la pantalla Lunito deja de hablar.
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      lunitoVoice.setThinking(false);
      lunitoVoice.stop();
    };
  }, []);

  const locale = useLocale();
  const line = reply?.text ?? greeting(context, locale);

  const ask = useCallback(
    (raw: string) => {
      const message = raw.trim().slice(0, LIMITS.messageChars);
      if (!message || busy.current) return;
      busy.current = true;
      setHeard(message);
      setThinking(true);
      lunitoVoice.stop();
      lunitoVoice.setThinking(true);
      void (async () => {
        let answer: LunitoReplyResponse;
        // La emergencia se reconoce en los dos idiomas.
        if (detectEmergency(message)) answer = emergencyReply(context, locale);
        else
          answer = await api
            .lunitoReply({ message, context, history: history.current })
            .catch(() => fallbackReply(context, locale));
        if (!alive.current) return;
        // Un turno de emergencia nunca viaja a la IA, ni siquiera como
        // historial del mensaje siguiente.
        if (answer.suggest === "emergencia") setEmergency(true);
        else
          history.current = [
            ...history.current,
            { role: "user" as const, text: message },
            { role: "lunito" as const, text: answer.text },
          ].slice(-LIMITS.historyTurns);
        busy.current = false;
        lunitoVoice.setThinking(false);
        setThinking(false);
        setReply(answer);
        void lunitoVoice.say(answer.text);
      })();
    },
    [context, locale],
  );

  const repeat = useCallback(() => void lunitoVoice.say(line), [line]);

  return {
    line,
    heard,
    suggest: emergency ? "emergencia" : (reply?.suggest ?? null),
    thinking,
    speaking,
    ask,
    repeat,
  };
}
