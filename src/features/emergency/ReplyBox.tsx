// Respuesta del cirujano: llega a la nave como un paso nuevo de la checklist.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addOrder } from "./caseLogic";
import { updateCase } from "./caseStore";

export function ReplyBox({ disabled }: { disabled: boolean }) {
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim()) return;
    updateCase((c) => addOrder(c, text, Date.now()));
    setText("");
  };

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <label htmlFor="ground-reply" className="text-sm font-semibold">
        Indicación para el oficial médico
      </label>
      <textarea
        id="ground-reply"
        rows={3}
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ej.: mantener en reposo y repetir la medición en 10 min"
        className="resize-y rounded-xl border bg-card p-3 text-[0.95rem] outline-none focus:border-primary disabled:opacity-50"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          Llega a la nave como un paso de la checklist.
        </span>
        <Button
          type="submit"
          disabled={disabled || !text.trim()}
          className="h-11 px-5 text-base"
        >
          Enviar a la nave
        </Button>
      </div>
    </form>
  );
}
