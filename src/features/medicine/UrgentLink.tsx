// Salida a Emergencia desde el Botiquín, con la persona activa ya elegida:
// donde no hay protocolo, nunca queda un callejón sin salida.
import { TriangleAlert } from "lucide-react";
import { useActiveProfile } from "@/features/profiles/activeProfile";
import { t } from "@/i18n";
import { emergencyHref } from "./assistant";

export function UrgentLink({ label }: { label?: string }) {
  const me = useActiveProfile();
  return (
    <a className="medicine-urgent" href={emergencyHref(me)}>
      <TriangleAlert aria-hidden="true" />
      {label ?? t("medicine.pending.urgent")}
    </a>
  );
}
