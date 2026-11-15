// Datos que ya registra la nave (HU-02): hoy y el ejercicio de 7 días. Que son
// datos simulados lo dice un solo aviso, en Configuración.
import { exerciseTotal, FEED } from "@/data/feed";
import { formatNumber, t } from "@/i18n";

/** `personId` llega de quien la monta: el perfil activo. */
export function ShipFeedCard({ personId }: { personId: string }) {
  const days = FEED[personId]!;
  const today = days[days.length - 1]!;
  const weekMin = days.slice(-7).reduce((s, d) => s + exerciseTotal(d), 0);
  // Los símbolos de las unidades son iguales en los dos idiomas.
  const rows: [string, string][] = [
    [t("status.ship.dose"), `${formatNumber(today.doseMsv)} mSv`],
    [
      t("status.ship.exercise"),
      t("status.ship.minutes", { value: formatNumber(weekMin) }),
    ],
    [t("status.ship.co2"), `${formatNumber(today.co2Mmhg)} mmHg`],
    [t("status.ship.temperature"), `${formatNumber(today.tempC)} °C`],
    [t("status.ship.pressure"), `${formatNumber(today.pressureKpa)} kPa`],
    [
      t("status.ship.humidity"),
      formatNumber(today.humidityPct / 100, { style: "percent" }),
    ],
  ];

  return (
    <section className="status-card status-ship" aria-labelledby="ship-title">
      <h2 id="ship-title">{t("status.ship.title")}</h2>
      <p>{t("status.ship.description")}</p>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
