import { Check, Heart, X } from "lucide-react";
import type { TeamEntry } from "./teamMembers";

export const NO_BACKEND =
  "El envío de ánimo aún no está disponible: falta el backend";

export function TeamSheet({
  entry,
  onClose,
}: {
  entry: TeamEntry;
  onClose: () => void;
}) {
  return (
    <section className="team-sheet" aria-label={`Detalle de ${entry.name}`}>
      <button
        className="team-sheet-close"
        aria-label="Cerrar"
        onClick={onClose}
      >
        <X aria-hidden="true" />
      </button>
      <div className="team-sheet-info">
        <h2 data-status={entry.status ?? "none"}>
          {entry.name} · {entry.label}
          {entry.status && (
            <span className="team-sheet-check">
              <Check aria-hidden="true" />
            </span>
          )}
        </h2>
        <p>{entry.status ? "Estado compartido" : "No comparte su estado"}</p>
      </div>
      <button
        className="team-cheer team-cheer-solid"
        disabled
        title={NO_BACKEND}
      >
        <Heart aria-hidden="true" />
        Enviar ánimo
      </button>
    </section>
  );
}
