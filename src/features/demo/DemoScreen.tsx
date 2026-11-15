// Panel oculto de la demo (HU-28): dispara cada paso de SISTEMA.md §11 con un
// botón. No sale en la navegación normal; se abre a mano en /demo.
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { crewMember } from "@/data/crew";
import { DASHBOARD_READINGS } from "@/data/dashboard";
import { openCase } from "@/features/emergency/caseLogic";
import { saveCase } from "@/features/emergency/caseStore";
import { resetShared } from "@/features/crew/privacy";
import { resetActiveProfile } from "@/features/profiles/activeProfile";
import { CO2_MODULE, setCo2State, useCo2State } from "./demoStore";
import { setReadingIndex, useReadingIndex } from "./readingStore";

const CO2_LABEL = {
  normal: "Subir el CO2 de un módulo",
  alto: `CO2 alto en el ${CO2_MODULE.toLowerCase()}: marcar resuelto a bordo`,
  resuelto: "CO2 resuelto a bordo",
};

const Simulated = () => (
  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
    simulado
  </span>
);

export function DemoScreen() {
  const co2 = useCo2State();
  const reading = useReadingIndex();
  const ana = crewMember("ana");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Panel de la demo <Simulated />
          </CardTitle>
          <CardDescription>
            Cada botón dispara un evento simulado para mostrar el paso en el
            momento justo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            className="h-12 justify-start px-4"
            disabled={co2 === "resuelto"}
            onClick={() => setCo2State(co2 === "normal" ? "alto" : "resuelto")}
          >
            {CO2_LABEL[co2]}
          </Button>
          <Button
            className="h-12 justify-start px-4"
            onClick={() =>
              saveCase(openCase(ana.id, ana.name, "Se desmayó", Date.now()))
            }
          >
            Simular la emergencia de {ana.name}
          </Button>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">
              Lectura que muestra Inicio
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {DASHBOARD_READINGS.map((r, i) => (
                <Button
                  key={r.name}
                  variant={i === reading ? "default" : "outline"}
                  aria-pressed={i === reading}
                  className="h-12"
                  onClick={() => setReadingIndex(i)}
                >
                  {r.name}
                </Button>
              ))}
            </div>
          </fieldset>
          <Button
            variant="outline"
            className="h-12 justify-start px-4"
            onClick={() => {
              setReadingIndex(0);
              setCo2State("normal");
              saveCase(null);
              resetActiveProfile();
              resetShared();
            }}
          >
            Reiniciar los datos de la demo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
