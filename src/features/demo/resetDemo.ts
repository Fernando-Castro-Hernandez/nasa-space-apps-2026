// Reinicio de la demo (HU-28): borra todo lo que la demo guardó en este
// dispositivo, para empezar el recorrido desde cero. El idioma y el silencio
// de Lunito son preferencias de la persona: se quedan.
import { resetDayStart } from "@/app/dayStart";
import { resetEncouragement } from "@/features/crew/encouragement";
import { resetShared } from "@/features/crew/privacy";
import { saveCase } from "@/features/emergency/caseStore";
import { resetDailyActions } from "@/features/medicine/actionStore";
import { resetActiveProfile } from "@/features/profiles/activeProfile";
import { resetVoiceLogs } from "@/features/voice/voiceLogStore";
import { setCo2State } from "./demoStore";
import { setReadingIndex } from "./readingStore";

export function resetDemo() {
  resetDayStart();
  resetVoiceLogs();
  resetDailyActions();
  resetEncouragement();
  resetActiveProfile();
  resetShared();
  saveCase(null);
  setCo2State("normal");
  setReadingIndex(0);
}
