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
import { openCase } from "@/features/emergency/caseLogic";
import { saveCase } from "@/features/emergency/caseStore";
import { resetActiveProfile } from "@/features/profiles/activeProfile";
import { CO2_MODULE, setCo2Raised, useCo2Raised } from "./demoStore";

const Simulated = () => (
  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
    simulado
  </span>
);

export function DemoScreen() {
  const co2Raised = useCo2Raised();
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
            disabled={co2Raised}
            onClick={() => setCo2Raised(true)}
          >
            {co2Raised
              ? `CO2 alto en: ${CO2_MODULE}`
              : "Subir el CO2 de un módulo"}
          </Button>
          <Button
            className="h-12 justify-start px-4"
            onClick={() =>
              saveCase(openCase(ana.id, ana.name, "Se desmayó", Date.now()))
            }
          >
            Simular la emergencia de {ana.name}
          </Button>
          <Button
            variant="outline"
            className="h-12 justify-start px-4"
            onClick={() => {
              setCo2Raised(false);
              saveCase(null);
              resetActiveProfile();
            }}
          >
            Reiniciar los datos de la demo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
