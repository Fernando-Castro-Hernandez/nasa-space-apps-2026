import { useState } from "react";
import {
  Bone,
  Brain,
  Eye,
  type LucideIcon,
  Search,
  Waves,
  Wind,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export type Symptom = { id: string; name: string; icon: LucideIcon };

// Síntomas frecuentes en vuelo (SISTEMA.md §6). Solo dolor de cabeza tiene
// protocolo con fuente; el resto queda pendiente de validar.
export const SYMPTOMS: Symptom[] = [
  { id: "headache", name: "Dolor de cabeza", icon: Brain },
  { id: "nausea", name: "Náusea y mareo", icon: Waves },
  { id: "congestion", name: "Congestión nasal", icon: Wind },
  { id: "back", name: "Dolor de espalda", icon: Bone },
  { id: "eyes", name: "Cambios en la visión", icon: Eye },
];

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

type Props = { onPick: (s: Symptom) => void };

export function SymptomSearch({ onPick }: Props) {
  const [q, setQ] = useState("");
  const shown = SYMPTOMS.filter((s) =>
    normalize(s.name).includes(normalize(q)),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <label htmlFor="symptom-search" className="sr-only">
          Buscar síntoma
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="symptom-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="¿Qué sientes?"
          className="h-11 pl-9"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {shown.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onPick(s)}
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border bg-card p-4 text-sm font-medium hover:border-primary hover:bg-accent"
          >
            <s.icon className="size-7 text-primary" aria-hidden="true" />
            {s.name}
          </button>
        ))}
      </div>
      {shown.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No encontramos ese síntoma. Avisa al oficial médico.
        </p>
      )}
    </div>
  );
}
