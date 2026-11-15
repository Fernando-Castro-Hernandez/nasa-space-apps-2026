// Checklist del protocolo y de las indicaciones que llegan de Tierra. Cada
// paso marcado queda en el registro con su hora. Cerrado el caso, la lista
// queda como constancia y ya no se marca.
import { Check } from "lucide-react";
import { t } from "@/i18n";
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
  closed: boolean;
  onCheck: () => void;
  note?: string;
};

function Item({ text, doneAt, current, closed, onCheck, note }: ItemProps) {
  const done = doneAt !== undefined;
  return (
    <li>
      <button
        type="button"
        data-step
        onClick={onCheck}
        disabled={done || closed}
        aria-pressed={done}
        data-current={current || undefined}
        className="em-step em-tap"
      >
        <span className="em-box" aria-hidden="true">
          {done && <Check />}
        </span>
        <span className="em-step-text">
          <span>{text}</span>
          {note && <span className="em-step-note">{note}</span>}
        </span>
        {done ? (
          <span className="em-step-time">{formatTime(doneAt)}</span>
        ) : (
          current && (
            <span className="em-now">{t("emergency.protocol.now")}</span>
          )
        )}
      </button>
    </li>
  );
}

export function ProtocolChecklist({ c }: { c: EmergencyCase }) {
  const closed = c.closedAt !== undefined;
  // Un solo paso "ahora": primero la indicación de Tierra pendiente, luego el
  // siguiente paso del protocolo.
  const nextOrder = c.orders.find((o) => o.doneAt === undefined)?.id;
  const nextStep = nextOrder
    ? undefined
    : PROTOCOL.find((s) => c.steps[s.id] === undefined)?.id;
  return (
    <div className="flex flex-col gap-4">
      {c.orders.length > 0 && (
        <ul
          className="em-steps"
          aria-label={t("emergency.protocol.groundOrders")}
        >
          {c.orders.map((o) => (
            <Item
              key={o.id}
              text={o.text}
              doneAt={o.doneAt}
              closed={closed}
              current={!closed && o.id === nextOrder}
              note={t("emergency.protocol.orderNote", {
                time: formatTime(o.sentAt),
              })}
              onCheck={() => updateCase((x) => checkOrder(x, o.id, Date.now()))}
            />
          ))}
        </ul>
      )}
      <ul className="em-steps" aria-label={t("emergency.protocol.title")}>
        {PROTOCOL.map((s) => (
          <Item
            key={s.id}
            text={s.text}
            doneAt={c.steps[s.id]}
            closed={closed}
            current={!closed && s.id === nextStep}
            onCheck={() => updateCase((x) => checkStep(x, s.id, Date.now()))}
          />
        ))}
      </ul>
    </div>
  );
}
