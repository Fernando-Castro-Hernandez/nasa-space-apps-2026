// Checklist del protocolo y de las indicaciones que llegan de Tierra. Cada
// paso marcado queda en el registro con su hora.
import { Check } from "lucide-react";
import {
  checkOrder,
  checkStep,
  type EmergencyCase,
  PROTOCOL,
} from "./caseLogic";
import { updateCase } from "./caseStore";
import { formatTime } from "./link";

type ItemProps = {
  text: string;
  doneAt?: number;
  current: boolean;
  onCheck: () => void;
  note?: string;
};

function Item({ text, doneAt, current, onCheck, note }: ItemProps) {
  const done = doneAt !== undefined;
  return (
    <li>
      <button
        type="button"
        onClick={onCheck}
        disabled={done}
        aria-pressed={done}
        className={`flex min-h-14 w-full items-center gap-4 rounded-xl border-2 px-4 text-left ${
          current
            ? "border-foreground bg-card font-semibold"
            : "border-border bg-card"
        } ${done ? "text-muted-foreground" : ""}`}
      >
        <span
          className={`flex size-7 shrink-0 items-center justify-center rounded-md border-2 ${
            done
              ? "border-status-ok bg-status-ok text-white"
              : "border-foreground"
          }`}
          aria-hidden="true"
        >
          {done && <Check className="size-4" />}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className={`text-base ${done ? "line-through" : ""}`}>
            {text}
          </span>
          {note && <span className="text-xs text-status-warn">{note}</span>}
        </span>
        <span className="font-mono text-sm tabular-nums">
          {done ? formatTime(doneAt) : current ? "ahora" : ""}
        </span>
      </button>
    </li>
  );
}

export function ProtocolChecklist({ c }: { c: EmergencyCase }) {
  const nextStep = PROTOCOL.find((s) => c.steps[s.id] === undefined)?.id;
  const closed = c.closedAt !== undefined;
  return (
    <div className="flex flex-col gap-4">
      {c.orders.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Indicaciones de Tierra">
          {c.orders.map((o) => (
            <Item
              key={o.id}
              text={o.text}
              doneAt={o.doneAt}
              current={!closed && o.doneAt === undefined}
              note={`Indicación de Tierra · enviada ${formatTime(o.sentAt)}`}
              onCheck={() => updateCase((x) => checkOrder(x, o.id, Date.now()))}
            />
          ))}
        </ul>
      )}
      <ul className="flex flex-col gap-2" aria-label="Protocolo">
        {PROTOCOL.map((s) => (
          <Item
            key={s.id}
            text={s.text}
            doneAt={c.steps[s.id]}
            current={!closed && s.id === nextStep}
            onCheck={() => updateCase((x) => checkStep(x, s.id, Date.now()))}
          />
        ))}
      </ul>
    </div>
  );
}
