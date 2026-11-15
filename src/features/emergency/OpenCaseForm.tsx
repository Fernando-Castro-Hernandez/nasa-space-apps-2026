// Primer paso de la emergencia: a quién le pasa y qué pasó. Un toque por
// respuesta; el sensor no detecta un desmayo, siempre lo dispara una persona.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CREW } from "@/data/crew";
import { openCase, WHAT_HAPPENED } from "./caseLogic";
import { saveCase } from "./caseStore";

const choice = (selected: boolean) =>
  `min-h-14 rounded-xl border-2 px-4 text-left text-base font-semibold transition-colors ${
    selected
      ? "border-status-alert bg-status-alert text-white"
      : "border-border bg-card hover:border-status-alert"
  }`;

export function OpenCaseForm() {
  const [personId, setPersonId] = useState<string | null>(null);
  const [what, setWhat] = useState<string | null>(null);
  const person = CREW.find((c) => c.id === personId);

  const open = () => {
    if (!person || !what) return;
    saveCase(openCase(person.id, person.name, what, Date.now()));
    // El botón está al final del formulario: sin esto, el banner rojo del
    // caso queda fuera de la vista en celular.
    window.scrollTo(0, 0);
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4 md:gap-6 md:p-6">
      <p className="rounded-xl border-2 border-status-alert px-4 py-3 text-base font-semibold text-status-alert">
        Demostración local: abrir el caso no envía una alerta a Tierra.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">¿A quién le pasa?</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CREW.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={c.id === personId}
              onClick={() => setPersonId(c.id)}
              className={choice(c.id === personId)}
            >
              {c.name}
              <span className="block text-sm font-normal opacity-80">
                {c.role}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">¿Qué pasó?</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {WHAT_HAPPENED.map((w) => (
            <button
              key={w}
              type="button"
              aria-pressed={w === what}
              onClick={() => setWhat(w)}
              className={choice(w === what)}
            >
              {w}
            </button>
          ))}
        </CardContent>
      </Card>

      <Button
        onClick={open}
        disabled={!person || !what}
        className="h-16 rounded-2xl bg-status-alert text-lg font-bold text-white hover:bg-status-alert/90"
      >
        {person && what
          ? `Abrir emergencia · ${person.name}`
          : "Elige a la persona y qué pasó"}
      </Button>
    </div>
  );
}
