import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, BriefcaseMedical } from "lucide-react";
import { DAY_ACTIONS } from "@/data/actions";
import saludo from "@/features/day-checkin/assets/lunito-saludo.webp";
import { LunitoAvatar } from "@/features/lunito/LunitoAvatar";
import { useDailyActions } from "@/features/medicine/actionStore";
import { useActiveProfile } from "@/features/profiles/activeProfile";
import { useTodayVoiceLog } from "@/features/voice/voiceLogStore";
import { formatDate, t } from "@/i18n";
import { Marea } from "../Marea";
import { ReferenceHeader, ReferenceNav } from "../ReferenceChrome";
import { SoonBlocks } from "./SoonBlocks";
import { checkInTime, taskProgress } from "./tasks";
import "../reference.css";
import "./tasks.css";

/** How long Lunito celebrates after the last task of the day is ticked. */
const CELEBRATION_MS = 3200;

function TaskRow({
  title,
  detail,
  checked,
  disabled,
  onChange,
  children,
}: {
  title: string;
  detail?: string;
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
          {detail && <small>{detail}</small>}
        </span>
      </label>
      {children}
    </li>
  );
}

export function ReferenceTasksScreen() {
  const completed = useDailyActions();
  // The check-in is done once today's voice log is saved (one source of truth).
  const log = useTodayVoiceLog(useActiveProfile());
  const savedAt = checkInTime(log);
  const progress = taskProgress([
    log !== null,
    ...DAY_ACTIONS.map((action) => completed.checked(action.id)),
  ]);

  // Lunito shows up small once everything is done. If the last tick happens
  // here, it celebrates once and then rests.
  const [cheering, setCheering] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const toggle = (id: string, value: boolean) => {
    completed.toggle(id, value);
    if (value && progress.count + 1 === progress.total) {
      setCheering(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(
        () => setCheering(false),
        CELEBRATION_MS,
      );
    }
  };

  return (
    <div className="reference-app">
      <ReferenceHeader title={t("tasks.title")} />
      <main className="tasks-page" aria-label={t("tasks.title")}>
        <div className="tasks-inner">
          <div className="tasks-head">
            <h1>{t("tasks.today")}</h1>
            {progress.done && (
              <LunitoAvatar
                className="tasks-lunito"
                pose={cheering ? "celebrating" : "idle"}
                fallbackSrc={saludo}
                label={t("tasks.allDone")}
              />
            )}
          </div>
          <p className="tasks-count" aria-live="polite">
            {progress.label}
          </p>
          <progress
            className="tasks-bar"
            aria-label={t("tasks.progressLabel")}
            max={100}
            value={progress.percent}
          />
          <div className="tasks-list">
            <Marea variant="mission" />
            <ul>
              <TaskRow
                title={t("tasks.checkIn.title")}
                detail={
                  log === null
                    ? undefined
                    : savedAt === null
                      ? t("tasks.checkIn.done")
                      : t("tasks.checkIn.doneAt", {
                          // 24 h, como el resto de las horas de la misión.
                          time: formatDate(savedAt, {
                            hour: "2-digit",
                            minute: "2-digit",
                            hourCycle: "h23",
                          }),
                        })
                }
                checked={log !== null}
                disabled
              >
                {log === null && (
                  <a className="tasks-start" href="/buenos-dias">
                    {t("tasks.checkIn.start")}
                    <ArrowRight aria-hidden="true" />
                  </a>
                )}
              </TaskRow>
              {DAY_ACTIONS.map((action) => (
                <TaskRow
                  key={action.id}
                  title={action.text}
                  checked={completed.checked(action.id)}
                  onChange={(value) => toggle(action.id, value)}
                />
              ))}
            </ul>
          </div>
          {/* The med kit sits right under today's list, where it is seen. */}
          <a className="tasks-kit" href="/botiquin">
            <span className="tasks-kit-icon">
              <BriefcaseMedical aria-hidden="true" />
            </span>
            <span className="tasks-kit-text">
              <small>{t("tasks.kit.question")}</small>
              <strong>{t("tasks.kit.link")}</strong>
            </span>
            <ArrowRight aria-hidden="true" />
          </a>
          <SoonBlocks />
        </div>
      </main>
      <ReferenceNav pathname="/tareas" />
    </div>
  );
}
