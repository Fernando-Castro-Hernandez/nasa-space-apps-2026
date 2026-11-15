// "Mantén para dictar": mientras se mantiene presionado escucha; al soltar,
// la nota queda en el registro. En la demo la nota es simulada.
// Con teclado, Enter o Espacio la registran directamente.
import { Mic } from "lucide-react";
import { useState } from "react";
import { addNote } from "./caseLogic";
import { updateCase } from "./caseStore";

const record = () => updateCase((c) => addNote(c, Date.now()));

export function DictateButton({ disabled }: { disabled: boolean }) {
  const [listening, setListening] = useState(false);

  const stop = () => {
    if (!listening) return;
    setListening(false);
    record();
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={() => setListening(true)}
      onPointerUp={stop}
      onPointerLeave={stop}
      onClick={(e) => {
        // detail === 0: activado con teclado, no con el puntero.
        if (e.detail === 0) record();
      }}
      className={`flex h-16 w-full select-none items-center justify-center gap-3 rounded-2xl text-lg font-bold disabled:opacity-50 ${
        listening
          ? "bg-status-alert text-white"
          : "bg-foreground text-background"
      }`}
    >
      <Mic className="size-6" aria-hidden="true" />
      {listening ? "Escuchando… suelta para guardar" : "Mantén para dictar"}
    </button>
  );
}
