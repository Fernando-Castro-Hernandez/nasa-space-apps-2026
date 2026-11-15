import type { CrewMember } from "@/data/crew";
import { STATUS_LABEL } from "@/domain/status";
import type { Status } from "@/domain/vitals";
import { publicStatus, type Shared } from "@/features/crew/privacy";

export type TeamEntry = {
  id: string;
  name: string;
  /** null when the person does not share (or is red: both look the same). */
  status: Status | null;
  /** Public state word, or "Sin compartir". */
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
        label: status ? STATUS_LABEL[status] : "Sin compartir",
      };
    });
}
