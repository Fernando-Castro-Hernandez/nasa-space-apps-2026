import { useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { DAY_ACTIONS } from "@/data/actions";
import { needsDayStart } from "@/app/dayStart";
import { useDailyActions } from "@/features/medicine/actionStore";
import { Marea } from "../Marea";
import { ReferenceHeader, ReferenceNav } from "../ReferenceChrome";
import { SoonBlocks } from "./SoonBlocks";
import { taskProgress } from "./tasks";
import "../reference.css";
import "./tasks.css";

function TaskRow({
  title,
  checked,
  disabled,
  onChange,
  children,
}: {
  title: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  children?: ReactNode;
}) {
  return (
    <li className="tasks-row">
      <label>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
        />
        <span>
          <strong>{title}</strong>
          {checked && disabled && <small>Completado</small>}
        </span>
      </label>
      {children}
    </li>
  );
}

export function ReferenceTasksScreen() {
  const completed = useDailyActions();
  const [dayStartPending] = useState(needsDayStart);
  const progress = taskProgress([
    !dayStartPending,
    ...DAY_ACTIONS.map((action) => completed.checked(action.id)),
  ]);
  return (
    <div className="reference-app">
      <ReferenceHeader title="Tareas" />
      <main className="tasks-page" aria-label="Tareas">
        <div className="tasks-inner">
          <h1>Hoy</h1>
          <p className="tasks-count">{progress.label}</p>
          <progress
            className="tasks-bar"
            aria-label="Progreso de hoy"
            max={100}
            value={progress.percent}
          />
          <div className="tasks-list">
            <Marea variant="mission" />
            <ul>
              <TaskRow
                title="Check-in del día"
                checked={!dayStartPending}
                disabled
              >
                {dayStartPending && (
                  <a className="tasks-start" href="/buenos-dias">
                    Comenzar <ArrowRight aria-hidden="true" />
                  </a>
                )}
              </TaskRow>
              {DAY_ACTIONS.map((action) => (
                <TaskRow
                  key={action.id}
                  title={action.text}
                  checked={completed.checked(action.id)}
                  onChange={(value) => completed.toggle(action.id, value)}
                />
              ))}
            </ul>
          </div>
          <SoonBlocks />
          <a className="tasks-kit" href="/botiquin">
            Botiquín <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </main>
      <ReferenceNav pathname="/tareas" />
    </div>
  );
}
