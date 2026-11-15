// Checklist del protocolo y de las indicaciones que llegan de Tierra. Cada
// paso marcado queda en el registro con su hora. Cerrado el caso, la lista
// queda como constancia y ya no se marca.
import { Bluetooth, Check } from "lucide-react";
import { connectSensor } from "@/features/sensor/sensorStore";
import { useLiveVitals } from "@/features/sensor/useLiveVitals";
import { formatNumber, t } from "@/i18n";
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
  // El paso del sensor registra lo que la estación mide en ese momento; sin
  // estación registra una muestra simulada, y se avisa antes de marcarlo.
  const { link, vitals } = useLiveVitals();
  const connected = link === "on";
  const sensorPending = !closed && c.steps.sensor === undefined;
  const sensorNote = !sensorPending
    ? undefined
    : vitals
      ? t("emergency.protocol.sensor.live", {
          bpm: formatNumber(vitals.bpm),
          spo2: formatNumber(vitals.spo2),
        })
      : connected
        ? t("emergency.protocol.sensor.waiting")
        : t("emergency.protocol.sensor.sample");
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
            note={s.vitals ? sensorNote : undefined}
            onCheck={() =>
              updateCase((x) =>
                checkStep(
                  x,
                  s.id,
                  Date.now(),
                  s.vitals && connected ? vitals : undefined,
                ),
              )
            }
          />
        ))}
      </ul>
      {sensorPending && !connected && link !== "unsupported" && (
        <button
          type="button"
          className="em-secondary em-tap"
          disabled={link === "connecting"}
          onClick={() => void connectSensor()}
        >
          <Bluetooth aria-hidden="true" />
          {link === "connecting"
            ? t("emergency.protocol.sensor.connecting")
            : t("emergency.protocol.sensor.connect")}
        </button>
      )}
    </div>
  );
}
