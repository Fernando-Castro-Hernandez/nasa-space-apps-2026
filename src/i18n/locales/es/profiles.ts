// Selector de perfil.
import type { Messages } from "../../translate";
import type { profiles as source } from "../en/profiles";

export const profiles: Messages<typeof source> = {
  title: "¿Quién eres?",
  hint: "Elige tu perfil: tus check-ins se guardan a tu nombre.",
};
