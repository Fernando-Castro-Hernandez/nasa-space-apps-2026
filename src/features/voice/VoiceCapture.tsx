// SIN USO desde el check-in único (/buenos-dias escucha con su propio
// micrófono y la hoja VoiceLogSheet): retirar junto con /check-in.
// Micrófono de la bitácora (HU-08): hasta 30 s con cuenta regresiva. Debajo,
// "Escribir respuesta" para quien no puede o no quiere hablar (DISENO.md).
import { Keyboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MicButton } from "./MicButton";
import { VOICE_LOG_SECONDS, type VoiceLogState } from "./useVoiceLog";

function statusText({ voice, phase }: VoiceLogState): string {
  if (voice.status === "starting") return "Preparando el micrófono…";
  if (voice.status === "listening") {
    const left = Math.max(0, VOICE_LOG_SECONDS - Math.floor(voice.elapsed));
    return `Escuchando · quedan ${left} s`;
  }
  if (voice.status === "transcribing") return "Pasando tu voz a texto…";
  if (voice.engine === "none") return "Este navegador no tiene dictado";
  if (phase !== "ask") return "Bitácora lista · toca para grabarla otra vez";
  return `Toca para hablar · hasta ${VOICE_LOG_SECONDS} s`;
}

export function VoiceCapture({ log }: { log: VoiceLogState }) {
  const { voice } = log;
  const listening = voice.status === "listening";

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-2">
        <MicButton
          voice={voice}
          onStart={log.listen}
          label="Empezar a grabar mi bitácora"
          size={88}
          className="my-3"
        />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {statusText(log)}
        </p>
        {voice.error && (
          <p role="alert" className="text-center text-sm font-medium">
            {voice.error}
          </p>
        )}
        {voice.engine === "browser" && !listening && (
          <p className="text-center text-xs text-muted-foreground">
            Sin conexión con la IA: uso el dictado del navegador.
          </p>
        )}
        <button
          type="button"
          onClick={log.write}
          disabled={listening || voice.status === "transcribing"}
          className="flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-primary hover:bg-accent disabled:opacity-40"
        >
          <Keyboard className="size-4" aria-hidden="true" />
          Escribir respuesta
        </button>
      </CardContent>
    </Card>
  );
}
