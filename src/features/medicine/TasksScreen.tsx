import { DAY_ACTIONS } from "@/data/actions";
import { MedicineScreen } from "./MedicineScreen";
import { useDailyActions } from "./actionStore";

export function DailyActions() {
  const completed = useDailyActions();
  return (
    <section className="orbita-panel" aria-labelledby="daily-actions">
      <h2 id="daily-actions" className="orbita-kicker">
        Qué hacer hoy
      </h2>
      <div className="mt-4 grid gap-2">
        {DAY_ACTIONS.map((action) => (
          <label key={action.id} className="orbita-task">
            <input
              type="checkbox"
              className="size-5 accent-primary"
              checked={completed.checked(action.id)}
              onChange={(event) =>
                completed.toggle(action.id, event.target.checked)
              }
            />
            <span>{action.text}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

export function TasksScreen() {
  return (
    <div className="orbita-tasks-page">
      <DailyActions />
      <section aria-label="Botiquín">
        <h2 className="orbita-section-title">Botiquín</h2>
        <MedicineScreen />
      </section>
    </div>
  );
}
