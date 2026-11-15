import { Bell, Lock } from "lucide-react";
import lunito from "@/features/day-checkin/assets/lunito-pregunta.webp";

// Neither the Aurora unlocks nor reminders exist in the product yet: both are
// drawn as in the reference but inert, with no state that could be mistaken
// for real data.
export function SoonBlocks() {
  return (
    <>
      <section className="tasks-aurora" aria-label="Aurora, próximamente">
        <img src={lunito} alt="" />
        <div>
          <strong>Aurora · 2 tareas para desbloquear</strong>
          <span>Estilo de Lunito</span>
        </div>
        <Lock aria-hidden="true" />
        <em className="tasks-soon">Próximamente</em>
      </section>
      <section
        className="tasks-reminder"
        aria-label="Recordatorio, próximamente"
      >
        <Bell aria-hidden="true" />
        <div>
          <strong>Próximo recordatorio</strong>
          <em className="tasks-soon">Próximamente</em>
        </div>
        <button type="button" disabled>
          Editar
        </button>
      </section>
    </>
  );
}
