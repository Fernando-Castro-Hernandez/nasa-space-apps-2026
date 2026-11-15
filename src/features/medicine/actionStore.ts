import { persistedStore } from "@/data/persisted";
import { DAY_ACTIONS } from "@/data/actions";
import { useActiveProfile } from "@/features/profiles/activeProfile";
import { useState } from "react";

const store = persistedStore<string>(
  "nostos.daily-actions",
  (raw) => raw ?? "",
  (value) => value,
);

/** Reinicio del panel /demo (HU-28): borra las tareas marcadas de todos. */
export const resetDailyActions = store.clear;

/** Las selecciones pertenecen al perfil y al día local, nunca a toda la tripulación. */
export function useDailyActions() {
  const profile = useActiveProfile();
  const raw = store.use();
  const [now] = useState(() => new Date());
  const day = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const prefix = `${profile}:${day}:`;
  const completed = raw.split("\n");
  return {
    checked: (id: string) => completed.includes(prefix + id),
    toggle: (id: string, checked: boolean) => {
      if (!DAY_ACTIONS.some((action) => action.id === id)) return;
      const values = store
        .get()
        .split("\n")
        .filter((value) => value && value !== prefix + id);
      if (checked) values.push(prefix + id);
      store.set(values.join("\n"));
    },
  };
}
