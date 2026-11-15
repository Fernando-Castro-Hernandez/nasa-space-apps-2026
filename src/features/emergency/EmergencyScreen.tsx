// Emergencia a bordo (SISTEMA.md §7.5 y §9.6): la ve el oficial médico, quizá
// flotando y sujetando a un compañero. Todo grande, legible y a prueba de
// toques accidentales; nada lúdico. Primero la franja roja (quién, qué y la
// hora); luego el aviso a Tierra con su retraso, el protocolo con el dictado
// y el registro del caso. El h1 de la página es solo para lectores de
// pantalla (MareaPage): la franja es lo primero que se ve. Salir de la
// pantalla no cierra el caso: solo "Cerrar caso", con confirmación.
import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { crewMember, MISSION } from "@/data/crew";
import { t } from "@/i18n";
import lunitoRojo from "./assets/lunito-rojo.png";
import { closeCase, type EmergencyCase, whatLabel } from "./caseLogic";
import { saveCase, updateCase, useCase, useNow } from "./caseStore";
import { CaseTimeline } from "./CaseTimeline";
import { DictateButton } from "./DictateButton";
import { countdown, formatTime, responseEta } from "./link";
import { OpenCaseForm } from "./OpenCaseForm";
import { ProtocolChecklist } from "./ProtocolChecklist";
import "./emergency.css";

/** Al abrir el caso, la franja roja queda arriba aunque el formulario
 *  estuviera desplazado. Fuera del componente: React la llama solo al montar. */
const showOnTop = (el: HTMLElement | null) =>
  el?.scrollIntoView?.({ block: "start" });

/** Aviso a Tierra: cuándo salió, el retraso y cuánto falta para la respuesta.
 *  Con el caso cerrado, el contador se detiene y dice a qué hora se cerró. */
function GroundLink({ c, now }: { c: EmergencyCase; now: number }) {
  const eta = responseEta(c.openedAt, MISSION.delayMinutes);
  const lastOrder = c.orders.at(-1);
  const closed = c.closedAt !== undefined;
  let state: string | null = null;
  if (c.closedAt !== undefined)
    state = t("emergency.link.closedAt", { time: formatTime(c.closedAt) });
  else if (lastOrder)
    state = t("emergency.link.replied", { time: formatTime(lastOrder.sentAt) });
  else if (now >= eta) state = t("emergency.link.due");

  return (
    <section className="em-card em-link" data-closed={closed || undefined}>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="em-link-sent">
          <Check className="em-check" aria-hidden="true" />
          {t("emergency.link.sent", { time: formatTime(c.openedAt) })}
        </p>
        {!closed && (
          <p className="em-link-delay">
            {t("emergency.link.delay", {
              minutes: MISSION.delayMinutes,
              time: formatTime(eta),
            })}
          </p>
        )}
      </div>
      <div className="em-countdown">
        {state ? (
          <p className="em-countdown-state">{state}</p>
        ) : (
          <>
            <p className="em-countdown-label">
              {t("emergency.link.countdown")}
            </p>
            <p className="em-countdown-value">{countdown(eta, now)}</p>
          </>
        )}
      </div>
    </section>
  );
}

/** Cerrar pide confirmación; ya cerrado, se puede empezar un caso nuevo. */
function CloseCase({ c, name }: { c: EmergencyCase; name: string }) {
  const [asking, setAsking] = useState(false);
  const keepOpen = useRef<HTMLButtonElement>(null);
  // "Cerrar caso" o, ya cerrado, "Nuevo caso".
  const closeButton = useRef<HTMLButtonElement>(null);
  const asked = useRef(false);
  const closed = c.closedAt !== undefined;
  // Al preguntar, el foco va a "No, sigue abierto"; al responder vuelve al
  // botón que queda, en lugar de perderse en la página.
  useEffect(() => {
    if (asking && !closed) {
      asked.current = true;
      keepOpen.current?.focus();
    } else if (asked.current) closeButton.current?.focus();
  }, [asking, closed]);

  if (closed)
    return (
      <button
        ref={closeButton}
        type="button"
        onClick={() => saveCase(null)}
        className="em-secondary em-tap"
      >
        {t("emergency.close.newCase")}
      </button>
    );

  if (!asking)
    return (
      <div className="flex flex-col gap-2">
        <button
          ref={closeButton}
          type="button"
          data-close-case
          onClick={() => setAsking(true)}
          className="em-secondary em-tap"
        >
          {t("emergency.close.button")}
        </button>
        <p className="em-hint">{t("emergency.close.stayOpen")}</p>
      </div>
    );

  return (
    <div className="em-confirm">
      <p id="em-close-question">{t("emergency.close.confirm", { name })}</p>
      <div>
        <button
          ref={keepOpen}
          type="button"
          aria-describedby="em-close-question"
          onClick={() => setAsking(false)}
          className="em-secondary em-tap"
        >
          {t("emergency.close.no")}
        </button>
        <button
          type="button"
          aria-describedby="em-close-question"
          data-confirm-close
          onClick={() => updateCase((x) => closeCase(x, Date.now()))}
          className="em-yes em-tap"
        >
          {t("emergency.close.yes")}
        </button>
      </div>
    </div>
  );
}

export function EmergencyScreen() {
  const c = useCase();
  const closed = c?.closedAt !== undefined;
  const now = useNow(c !== null && !closed);
  if (!c) return <OpenCaseForm />;

  const person = crewMember(c.personId);
  const opened = formatTime(c.openedAt);

  return (
    <div className="em-page">
      <section
        ref={showOnTop}
        className="em-banner"
        data-closed={closed || undefined}
        aria-labelledby="em-headline"
      >
        <img src={lunitoRojo} alt="" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="em-eyebrow">
            {closed
              ? t("emergency.banner.closed", { time: opened })
              : t("emergency.banner.open", { time: opened })}
          </p>
          <h2 id="em-headline" className="em-headline">
            {t("emergency.banner.headline", {
              name: person.name,
              what: whatLabel(c.what),
            })}
          </h2>
          <p className="em-banner-role">{person.role}</p>
        </div>
      </section>

      <div className="em-case">
        <GroundLink c={c} now={now} />

        <section className="em-card" aria-labelledby="em-protocol">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 id="em-protocol" className="em-section-title">
              {t("emergency.protocol.title")}
            </h2>
            <p className="em-pending">
              {t("emergency.protocol.sample", {
                pending: t("common.pendingValidation"),
              })}
            </p>
          </div>
          <ProtocolChecklist c={c} />
          {!closed && <DictateButton />}
        </section>

        <section className="em-card" aria-labelledby="em-log">
          <h2 id="em-log" className="em-section-title">
            {t("emergency.log.title")}
          </h2>
          <CaseTimeline events={c.events} live />
          <CloseCase c={c} name={person.name} />
        </section>
      </div>
    </div>
  );
}
