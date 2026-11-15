// Botiquín (SISTEMA.md §9.5): buscador de síntomas, asistente paso a paso e
// inventario. No diagnostica: guía el protocolo cargado y dice a quién acudir.
// Se muestra dentro de MareaPage, que ya pone la cabecera, el título y la
// salida a Tareas.
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { t } from "@/i18n";
import { HeadacheAssistant } from "./HeadacheAssistant";
import { InventoryList } from "./InventoryList";
import { Pending } from "./parts";
import { type Symptom, SymptomSearch } from "./SymptomSearch";
import { UrgentLink } from "./UrgentLink";
import "./medicine.css";

export function MedicineScreen() {
  const [tab, setTab] = useState("sintomas");
  const [symptom, setSymptom] = useState<Symptom | null>(null);

  return (
    <div className="medicine-page">
      <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
        <TabsList
          className="medicine-tabs"
          aria-label={t("medicine.tabs.label")}
        >
          <TabsTrigger value="sintomas" className="medicine-tab">
            {t("medicine.tabs.symptoms")}
          </TabsTrigger>
          <TabsTrigger value="inventario" className="medicine-tab">
            {t("medicine.tabs.inventory")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sintomas" className="medicine-panel">
          <section className="medicine-card" aria-labelledby="medicine-title">
            <h2 id="medicine-title">
              {symptom ? symptom.name : t("medicine.search.title")}
            </h2>
            {/* El único aviso del Botiquín: es guía clínica. */}
            <p className="medicine-disclaimer">{t("common.notDiagnosis")}</p>
            {!symptom && <SymptomSearch onPick={setSymptom} />}
            {symptom?.guided && (
              <HeadacheAssistant onExit={() => setSymptom(null)} />
            )}
            {symptom && !symptom.guided && (
              <PendingProtocol onExit={() => setSymptom(null)} />
            )}
          </section>
        </TabsContent>

        <TabsContent value="inventario" className="medicine-panel">
          <section
            className="medicine-card"
            aria-labelledby="medicine-inventory"
          >
            <h2 id="medicine-inventory">{t("medicine.inventory.title")}</h2>
            <p className="medicine-disclaimer">
              {t("medicine.inventory.description")}
            </p>
            <InventoryList />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** Síntoma sin protocolo con fuente: se dice y siempre hay una salida. */
function PendingProtocol({ onExit }: { onExit: () => void }) {
  return (
    <div className="medicine-pending">
      <p>
        {t("medicine.pending.noSource")} <Pending />
      </p>
      <p>{t("medicine.pending.meanwhile")}</p>
      <div className="medicine-exits">
        <button type="button" className="medicine-secondary" onClick={onExit}>
          <ChevronLeft aria-hidden="true" />
          {t("medicine.pending.back")}
        </button>
        <UrgentLink />
      </div>
    </div>
  );
}
