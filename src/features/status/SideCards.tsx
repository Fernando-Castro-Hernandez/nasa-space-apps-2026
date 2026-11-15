import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SAMPLE_READINGS } from "@/data/sample";

type Props = { sample: number; onSample: (i: number) => void };

/** Acciones del día y el selector de lectura de muestra para la demo. */
export function SideCards({ sample, onSample }: Props) {
  return (
    <div className="col-span-12 flex flex-col gap-4 md:gap-6 xl:col-span-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Qué hacer hoy</CardTitle>
          <CardDescription>
            Acciones según tu lectura, no un diagnóstico.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" className="size-5 accent-primary" />
            Respiración guiada · 5 min
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" className="size-5 accent-primary" />
            Apagar pantallas a las 22:00
          </label>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lectura de muestra</CardTitle>
          <CardDescription>
            Solo para la demo: cambia la lectura y mira a Lunito.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <select
            aria-label="Lectura de muestra"
            value={sample}
            onChange={(e) => onSample(Number(e.target.value))}
            className="h-11 w-full rounded-lg border bg-card px-3 text-sm"
          >
            {SAMPLE_READINGS.map((s, i) => (
              <option key={s.name} value={i}>
                {s.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>
    </div>
  );
}
