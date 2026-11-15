// Campos que la IA extrajo de la bitácora. Cada chip se puede corregir: la IA
// solo estructura lo que dijiste, tú confirmas (SISTEMA.md §5).
import { useState } from "react";
import { Plus } from "lucide-react";

type Field = { label: string; value: string };

const SAMPLE: Field[] = [
  { label: "Sueño", value: "5 h" },
  { label: "Ánimo", value: "bajo" },
  { label: "Dolor de cabeza", value: "leve" },
];

export function FieldChips() {
  const [fields, setFields] = useState(SAMPLE);
  const [editing, setEditing] = useState<number | null>(null);

  const update = (i: number, patch: Partial<Field>) =>
    setFields((fs) => fs.map((f, j) => (j === i ? { ...f, ...patch } : f)));

  const add = () => {
    setFields((fs) => [...fs, { label: "Nuevo", value: "" }]);
    setEditing(fields.length);
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Lo que entendí · toca para corregir
      </span>
      <div className="flex flex-wrap gap-2">
        {fields.map((f, i) =>
          editing === i ? (
            <form
              key={i}
              className="flex h-11 items-center gap-1 rounded-full border border-primary bg-card px-3"
              onSubmit={(e) => {
                e.preventDefault();
                setEditing(null);
              }}
            >
              <input
                aria-label="Campo"
                value={f.label}
                onChange={(e) => update(i, { label: e.target.value })}
                className="w-24 bg-transparent text-sm font-medium outline-none"
              />
              <span className="text-muted-foreground">·</span>
              <input
                aria-label={`Valor de ${f.label}`}
                value={f.value}
                onChange={(e) => update(i, { value: e.target.value })}
                onBlur={() => setEditing(null)}
                className="w-20 bg-transparent text-sm outline-none"
              />
            </form>
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => setEditing(i)}
              className="h-11 rounded-full border bg-card px-4 text-sm hover:border-primary"
            >
              <span className="font-medium">{f.label}</span>
              {f.value && (
                <span className="text-muted-foreground"> · {f.value}</span>
              )}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={add}
          className="flex h-11 items-center gap-1 rounded-full border border-dashed px-4 text-sm text-muted-foreground hover:border-primary hover:text-primary"
        >
          <Plus className="size-4" aria-hidden="true" />
          Agregar
        </button>
      </div>
    </div>
  );
}
