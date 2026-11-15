import type { CrewMember } from "@/data/crew";
import { STATUS_LABEL } from "@/domain/status";
import type { Status } from "@/domain/vitals";
import type { EmergencyCase } from "@/features/emergency/caseLogic";
import { publicStatus, type Shared } from "@/features/crew/privacy";
import { localeTag, t } from "@/i18n";

export type TeamEntry = {
  id: string;
  name: string;
  /** null when the person does not share (or is red: both look the same). */
  status: Status | null;
  /** Public state word, or "Not shared". */
  label: string;
};

/** Everyone but the active profile, with only what privacy lets others see. */
export function teamEntries(
  crew: CrewMember[],
  me: string,
  shared: Shared,
): TeamEntry[] {
  return crew
    .filter((member) => member.id !== me)
    .map((member) => {
      const status = publicStatus(member, shared);
      return {
        id: member.id,
        name: member.name,
        status,
        label: status ? STATUS_LABEL[status] : t("common.notShared"),
      };
    });
}

/** Who sent encouragement today, in one sentence ("Ana and Mei sent you
 *  encouragement"), or null if nobody did. */
export function cheersMessage(names: string[]): string | null {
  if (names.length === 0) return null;
  if (names.length === 1)
    return t("crew.encourage.received", { name: names[0]! });
  const list = new Intl.ListFormat(localeTag(), { type: "conjunction" });
  return t("crew.encourage.receivedMany", { names: list.format(names) });
}

/** An open emergency case (SISTEMA.md §7.5): who it is for and since when.
 *  The crew must see it, so it shows regardless of privacy. */
export function openEmergency(c: EmergencyCase | null) {
  return c && !c.closedAt ? { personId: c.personId, since: c.openedAt } : null;
}
