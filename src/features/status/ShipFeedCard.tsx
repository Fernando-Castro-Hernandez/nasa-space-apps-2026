// Datos que ya registra la nave (HU-02): hoy y el promedio de ejercicio de 7
// días, siempre con la etiqueta "simulado".
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { exerciseTotal, FEED, FEED_LABEL } from "@/data/feed";

/** `personId` llega de quien la monta; el perfil activo lo conecta HU-01. */
export function ShipFeedCard({ personId }: { personId: string }) {
  const days = FEED[personId]!;
  const today = days[days.length - 1]!;
  const weekMin = days.slice(-7).reduce((s, d) => s + exerciseTotal(d), 0);
  const rows: [string, string][] = [
    ["Dosis acumulada", `${today.doseMsv} mSv`],
    ["Ejercicio (7 días)", `${weekMin} min`],
    ["CO2 de cabina", `${today.co2Mmhg} mmHg`],
    ["Temperatura", `${today.tempC} °C`],
    ["Presión", `${today.pressureKpa} kPa`],
    ["Humedad", `${today.humidityPct} %`],
  ];

  return (
    <Card className="col-span-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Datos de la nave
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {FEED_LABEL}
          </span>
        </CardTitle>
        <CardDescription>
          Lo que registra la nave sobre dosis, ejercicio y ambiente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-base font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
