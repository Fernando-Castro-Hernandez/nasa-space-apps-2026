// Bitácora por voz simulada: micrófono grande, onda y cuenta de 30 s.
import { Mic, Square } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { secondsLeft, VOICE_SECONDS } from "./simulation";
import { useElapsed } from "./useElapsed";
import { useState } from "react";

const BARS = [14, 30, 44, 24, 38, 18, 32, 12, 26];

export function VoiceCard({ onDone }: { onDone: () => void }) {
  const [recording, setRecording] = useState(false);
  const [elapsed] = useElapsed(recording, VOICE_SECONDS);
  const left = secondsLeft(elapsed, VOICE_SECONDS);
  const finished = left === 0;

  const toggle = () => {
    if (recording) onDone();
    setRecording(!recording);
  };
  if (finished && recording) {
    setRecording(false);
    onDone();
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-2">
        <div aria-hidden="true" className="flex h-12 items-center gap-1.5">
          {BARS.map((h, i) => (
            <span
              key={i}
              className={`w-1.5 rounded-full bg-primary ${recording ? "motion-safe:animate-pulse" : "opacity-30"}`}
              style={{
                height: recording ? h : 8,
                animationDelay: `${i * 110}ms`,
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label={recording ? "Detener grabación" : "Empezar a grabar"}
          className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_0_10px] shadow-primary/15 hover:bg-primary/85"
        >
          {recording ? (
            <Square className="size-7" />
          ) : (
            <Mic className="size-8" />
          )}
        </button>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {recording
            ? `Escuchando · quedan ${left} s`
            : finished
              ? "Bitácora guardada"
              : `Toca para hablar · hasta ${VOICE_SECONDS} s`}
        </p>
      </CardContent>
    </Card>
  );
}
