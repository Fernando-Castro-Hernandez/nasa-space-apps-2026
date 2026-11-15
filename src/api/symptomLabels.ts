// Nombre de cada síntoma de la bitácora en el idioma activo. El contrato solo
// lleva los códigos (también los usa el Worker, que no puede importar `@/i18n`);
// el texto sale del diccionario, área `voice`.
import { t } from "@/i18n";
import type { Symptom } from "./contract";

/** `SYMPTOM_LABEL[symptom]`: se lee al momento, así sigue al idioma activo. */
export const SYMPTOM_LABEL: Readonly<Record<Symptom, string>> = {
  get mareo() {
    return t("voice.symptoms.mareo");
  },
  get congestion() {
    return t("voice.symptoms.congestion");
  },
  get dolor_cabeza() {
    return t("voice.symptoms.dolor_cabeza");
  },
  get dolor_espalda() {
    return t("voice.symptoms.dolor_espalda");
  },
  get otro() {
    return t("voice.symptoms.otro");
  },
};
