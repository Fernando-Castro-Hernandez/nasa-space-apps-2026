import type { VoiceLog } from "@/features/voice/voiceLogStore";
import { t } from "@/i18n";

export function taskProgress(done: boolean[]) {
  const total = done.length;
  const count = done.filter(Boolean).length;
  return {
    count,
    total,
    percent: total === 0 ? 0 : Math.round((count / total) * 100),
    done: total > 0 && count === total,
    label: t("tasks.progress", { count, total }),
  };
}

/** When today's voice log was saved (ms). Logs saved before the app kept the
 *  time have none. */
export const checkInTime = (log: VoiceLog | null): number | null =>
  log?.savedAt ?? null;
