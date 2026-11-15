// Acciones del día simuladas (HU-14 es de Ariff): hasta que su motor las
// entregue, Inicio y "Qué hacer hoy" leen estas mismas, de 1 a 3 (HU-15).
// No son diagnóstico: son hábitos generales. El texto es un getter para que
// siga el idioma activo; la respiración guiada es la misma acción del motor.
import { t } from "@/i18n";

export const DAY_ACTIONS: { id: string; text: string }[] = [
  {
    id: "breathing",
    get text() {
      return t("domain.actions.breathing");
    },
  },
  {
    id: "screens",
    get text() {
      return t("data.actions.screens");
    },
  },
];
