import { TriangleAlert } from "lucide-react";
import { STATUS_LABEL, STATUS_TOKEN } from "@/domain/status";
import type { HeadacheResult as Result } from "./headache";
import { Pending, Source } from "./parts";

const TITLE = {
  autocuidado: "Puedes cuidarte tú",
  "oficial médico": "Avisa al oficial médico",
  "cirujano de vuelo": "Contacta al cirujano de vuelo",
} as const;

export function HeadacheResult({ r }: { r: Result }) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex flex-col gap-1 rounded-xl border-2 p-4"
        style={{ borderColor: STATUS_TOKEN[r.level] }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: STATUS_TOKEN[r.level] }}
        >
          {STATUS_LABEL[r.level]}
        </span>
        <p className="text-xl font-semibold">{TITLE[r.who]}</p>
        {r.reasons.map((reason) => (
          <p key={reason} className="text-sm text-muted-foreground">
            {reason}
          </p>
        ))}
        {r.level === "rojo" && (
          <>
            <a
              href="/emergencia"
              className="mt-2 flex h-11 items-center justify-center gap-2 rounded-lg bg-status-alert px-4 text-sm font-semibold text-white"
            >
              <TriangleAlert className="size-4" aria-hidden="true" />
              Contacta al cirujano de vuelo
            </a>
            <Source>
              SNNOOP10, Do et al., Neurology 2019. Sin comunicación, el oficial
              médico actúa sin el cirujano (NTRS 20100016333).
            </Source>
          </>
        )}
        {r.level === "ambar" && (
          <Source>ICHD-3 8.2.3; Do et al., Neurology 2019; DailyMed.</Source>
        )}
      </div>

      {(r.checkVentilation || r.spaceAdaptation) && (
        <div className="flex flex-col gap-2 rounded-xl bg-muted p-4 text-sm">
          {r.checkVentilation && (
            <p>
              El CO2 de la cabina está alto: revisa primero la ventilación.{" "}
              <Source>OCHMO-TB-004</Source>
            </p>
          )}
          {r.spaceAdaptation && (
            <p>
              Primera semana de vuelo con náusea o congestión: es probable que
              sea adaptación al espacio. <Source>OCHMO-TB-033</Source>
            </p>
          )}
        </div>
      )}

      {r.level === "verde" && <SelfCare r={r} />}
    </div>
  );
}

function SelfCare({ r }: { r: Result }) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="font-semibold">Qué puedes hacer</p>
      <p>
        Descansa, duerme e hidrátate.{" "}
        <Source>van Oosterhout, Neurology 2024</Source>
      </p>
      <div className="rounded-xl border bg-card p-3">
        <p className="font-medium">Paracetamol</p>
        <p>
          Referencia de venta libre: 500 mg, 2 tabletas cada 6 h, máximo 6 en 24
          h. Te quedan {r.paracetamolRemaining} tabletas hoy.
        </p>
        <p className="text-muted-foreground">
          Botiquín de la ISS: 325 mg, no más de 12 tabletas en 24 h.
        </p>
      </div>
      <div className="rounded-xl border bg-card p-3">
        <p className="font-medium">Ibuprofeno</p>
        {r.ibuprofen === "no" ? (
          <p>No tomes ibuprofeno; usa paracetamol.</p>
        ) : (
          <>
            {r.ibuprofenNeedsFood && (
              <p className="font-medium">
                Come algo antes: se toma con comida.
              </p>
            )}
            <p>
              Referencia de venta libre: 200 mg, 1 o 2 tabletas cada 4 a 6 h,
              máximo 6 en 24 h.
            </p>
            <p className="text-muted-foreground">
              Botiquín de la ISS: 400 mg, con comida, no más de 8 en 24 h.
            </p>
          </>
        )}
      </div>
      <p>
        Con dolor de costado, cálculos renales o deshidratación, preferir
        paracetamol.
        <Pending />
      </p>
      <p>
        Ir a una zona mejor ventilada.
        <Pending />
      </p>
      <Source>
        DailyMed; NASA, Medical Kit 3.001 (2015), que el equipo toma como
        vigente.
      </Source>
    </div>
  );
}
