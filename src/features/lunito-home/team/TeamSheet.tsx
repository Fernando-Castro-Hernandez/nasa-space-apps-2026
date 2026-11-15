import {
  ArrowRight,
  Check,
  OctagonAlert,
  TriangleAlert,
  X,
} from "lucide-react";
import { EncourageButton } from "@/features/crew/EncourageButton";
import { formatDate, t } from "@/i18n";
import type { TeamEntry } from "./teamMembers";

// The color never goes alone: each public state has its own icon too.
const STATUS_ICON = { verde: Check, ambar: TriangleAlert, rojo: OctagonAlert };

export function TeamSheet({
  entry,
  emergencySince,
  onClose,
}: {
  entry: TeamEntry;
  /** When this person has an open emergency case: when it was opened. */
  emergencySince: number | null;
  onClose: () => void;
}) {
  const StatusIcon = entry.status && STATUS_ICON[entry.status];
  return (
    <section
      className="team-sheet"
      aria-label={t("team.sheet.label", { name: entry.name })}
      data-emergency={emergencySince !== null || undefined}
    >
      <button
        type="button"
        className="team-sheet-close"
        aria-label={t("common.actions.close")}
        onClick={onClose}
      >
        <X aria-hidden="true" />
      </button>
      {emergencySince !== null ? (
        <>
          <div className="team-sheet-info">
            <h2 data-status="rojo">
              {t("team.emergency.title", { name: entry.name })}
            </h2>
            <p>
              {t("team.emergency.since", {
                // 24 h, la misma hora de la nave que muestra el caso.
                time: formatDate(emergencySince, {
                  hour: "2-digit",
                  minute: "2-digit",
                  hourCycle: "h23",
                }),
              })}
            </p>
          </div>
          <a className="team-cheer team-cheer-alert" href="/emergencia">
            {t("team.emergency.viewCase")}
            <ArrowRight aria-hidden="true" />
          </a>
        </>
      ) : (
        <>
          <div className="team-sheet-info">
            <h2 data-status={entry.status ?? "none"}>
              {t("team.sheet.title", {
                name: entry.name,
                status: entry.label,
              })}
              {StatusIcon && (
                <span className="team-sheet-check">
                  <StatusIcon aria-hidden="true" />
                </span>
              )}
            </h2>
            <p>
              {entry.status
                ? t("team.sheet.shared")
                : t("team.sheet.notShared")}
            </p>
          </div>
          <EncourageButton
            toId={entry.id}
            className="team-cheer team-cheer-solid"
          />
        </>
      )}
    </section>
  );
}
