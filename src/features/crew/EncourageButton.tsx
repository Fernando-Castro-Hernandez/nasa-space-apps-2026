// Botón "Enviar ánimo" para un compañero. Lo usan Inicio (Tu misión) y Equipo.
// Es una acción sin otro efecto visible, así que el propio botón confirma:
// pasa a "Ánimo enviado a Luis" y queda así el resto del día.
//
//   <EncourageButton toId="luis" className="encouragement" />
//
// Quien lo coloca le da la forma con su clase; el botón siempre lleva además
// `encourage-button`, que anima la confirmación (encourage.css): el ícono crece
// en 300 ms al pasar a enviado, y nada se mueve con movimiento reducido.
import { Check, Heart } from "lucide-react";
import { useState } from "react";
import { crewMember } from "@/data/crew";
import { useActiveProfile } from "@/features/profiles/activeProfile";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  cheerDay,
  hasCheered,
  sendEncouragement,
  useCheers,
} from "./encouragement";
import "./encourage.css";

type Props = {
  /** Perfil que recibe el ánimo. */
  toId: string;
  /** Clases de quien lo coloca; `data-sent` permite dar estilo al enviado. */
  className?: string;
};

export function EncourageButton({ toId, className }: Props) {
  const me = useActiveProfile();
  // El día se fija al montar: el botón no cambia de día a media pantalla.
  const [today] = useState(() => cheerDay(new Date()));
  const sent = hasCheered(useCheers(), me, toId, today);
  const { name } = crewMember(toId);
  const Icon = sent ? Check : Heart;

  return (
    <button
      type="button"
      className={cn("encourage-button", className)}
      data-sent={sent || undefined}
      disabled={sent}
      onClick={() => sendEncouragement(me, toId)}
    >
      <Icon aria-hidden="true" />
      <span aria-live="polite">
        {sent ? t("crew.encourage.sent", { name }) : t("crew.encourage.send")}
      </span>
    </button>
  );
}
