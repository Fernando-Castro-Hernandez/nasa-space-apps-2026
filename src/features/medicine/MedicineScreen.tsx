// Botiquín (SISTEMA.md §9.5): buscador de síntomas, asistente paso a paso e
// inventario. No diagnostica: guía el protocolo cargado y dice a quién acudir.
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeadacheAssistant } from "./HeadacheAssistant";
import { InventoryList } from "./InventoryList";
import { Pending } from "./parts";
import { type Symptom, SymptomSearch } from "./SymptomSearch";

export function MedicineScreen() {
  const [tab, setTab] = useState("sintomas");
  const [symptom, setSymptom] = useState<Symptom | null>(null);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4 md:p-6">
      <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
        <TabsList>
          <TabsTrigger value="sintomas" className="h-10 px-4">
            Síntomas
          </TabsTrigger>
          <TabsTrigger value="inventario" className="h-10 px-4">
            Inventario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sintomas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {symptom ? symptom.name : "¿Qué sientes?"}
              </CardTitle>
              <CardDescription>
                Guía según el protocolo cargado, no un diagnóstico.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!symptom && <SymptomSearch onPick={setSymptom} />}
              {symptom?.id === "headache" && (
                <HeadacheAssistant onExit={() => setSymptom(null)} />
              )}
              {symptom && symptom.id !== "headache" && (
                <PendingProtocol onExit={() => setSymptom(null)} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventario" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inventario del botiquín</CardTitle>
              <CardDescription>
                Lo que queda a bordo, con faltantes y caducidad.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PendingProtocol({ onExit }: { onExit: () => void }) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <p>
        Este protocolo aún no tiene fuente cargada.
        <Pending />
      </p>
      <p>Mientras tanto, avisa al oficial médico.</p>
      <button
        type="button"
        onClick={onExit}
        className="h-11 self-start rounded-lg border px-4 font-medium hover:bg-muted"
      >
        Volver a síntomas
      </button>
    </div>
  );
}
