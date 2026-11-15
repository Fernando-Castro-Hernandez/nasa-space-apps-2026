// Luz D, Distancia (decisión del 2026-11-15): responde "¿podemos contar con
// Tierra ahora?". Mide el contexto de la misión, no la salud de una persona,
// y por eso nunca pasa de Precaución. El botiquín no entra: NASA ya lo
// controla con sus sistemas y queda en su propia pantalla.
import { finding, type Finding } from "@/domain/finding";
import { SOURCES } from "@/domain/sources";
import { formatNumber, t } from "@/i18n";

export type EarthLink = {
  /** Retraso de comunicación en un sentido, en minutos. */
  delayMinutes: number;
  /** false durante un apagón o una conjunción: no hay enlace con Tierra. */
  linkUp: boolean;
  /** Hay un caso enviado que todavía espera respuesta de Tierra. */
  awaitingEarth: boolean;
};

/** Ida y vuelta: lo mínimo que tarda una respuesta de Tierra. */
export const roundTripMinutes = (delayMinutes: number) => 2 * delayMinutes;

export function distanceRule(link: EarthLink): Finding {
  if (!link.linkUp) {
    return finding({
      id: "distance-nolink",
      hazard: "D",
      status: "ambar",
      reason: t("domain.reasons.noLink"),
      source: SOURCES.ntrsNoComm,
    });
  }
  if (link.awaitingEarth) {
    return finding({
      id: "distance-waiting",
      hazard: "D",
      status: "ambar",
      reason: t("domain.reasons.awaitingGround"),
      source: SOURCES.nasaDelay,
    });
  }
  return {
    id: "distance-ok",
    hazard: "D",
    status: "verde",
    reason: t("domain.reasons.groundResponds", {
      minutes: formatNumber(roundTripMinutes(link.delayMinutes)),
    }),
    source: SOURCES.nasaDelay,
  };
}
