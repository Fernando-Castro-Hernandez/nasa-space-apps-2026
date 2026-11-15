// Columna lateral de la consola: recursos a bordo y estado del enlace.
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/i18n";
import type { EmergencyCase } from "./caseLogic";
import { arrivesAt, formatTime } from "./link";

// Recursos de muestra para la demo; el inventario real vive en el botiquín.
// El aviso "Datos simulados" de la consola está en su barra superior.
const resources = () => [
  { name: t("ground.resources.oxygen"), note: t("ground.resources.unused") },
  {
    name: t("ground.resources.paracetamol"),
    note: t("ground.resources.perInventory"),
  },
  {
    name: t("ground.resources.ibuprofen"),
    note: t("ground.resources.perInventory"),
  },
  { name: t("ground.resources.aed"), note: t("ground.resources.available") },
];

type Props = { c: EmergencyCase; delayMinutes: number; now: number };

export function ConsoleSide({ c, delayMinutes, now }: Props) {
  const received = c.events.filter(
    (e) => now >= arrivesAt(e.at, delayMinutes),
  ).length;
  const total = c.events.length;
  const pending = total - received;
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            {t("ground.resources.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-2 text-[15px]">
            {resources().map((r) => (
              <div key={r.name} className="flex justify-between gap-3">
                <dt>{r.name}</dt>
                <dd className="text-right text-muted-foreground">{r.note}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            {t("ground.linkStatus.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-[15px]">
          <p>
            {t("ground.linkStatus.sent", {
              sent: formatTime(c.openedAt),
              arrives: formatTime(arrivesAt(c.openedAt, delayMinutes)),
            })}
          </p>
          <p>
            {pending > 0
              ? t("ground.linkStatus.receivedPending", {
                  received,
                  total,
                  pending,
                })
              : t("ground.linkStatus.received", { received, total })}
          </p>
          <p className="text-muted-foreground">
            {t("ground.linkStatus.note", { minutes: delayMinutes })}
          </p>
        </CardContent>
      </Card>
    </>
  );
}
