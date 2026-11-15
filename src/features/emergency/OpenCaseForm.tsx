// Primer paso de la emergencia: a quién le pasa y qué pasó. Un toque por
// respuesta; el sensor no detecta un desmayo, siempre lo dispara una persona.
// Con /emergencia?quien=<id> esa persona llega elegida. Cancelar no abre nada.
import { Check, Siren } from "lucide-react";
import { useState } from "react";
import { navigate } from "@/app/router";
import { CREW } from "@/data/crew";
import { t } from "@/i18n";
import { openCase, WHAT_HAPPENED, type WhatCode } from "./caseLogic";
import { saveCase } from "./caseStore";
import { presetPerson } from "./preset";

const CREW_IDS = CREW.map((c) => c.id);

/** Lo que dice el botón principal: la acción o lo que falta elegir. */
function openLabel(name: string | undefined, what: WhatCode | null) {
  if (name && what) return t("emergency.form.open", { name });
  if (name) return t("emergency.form.chooseWhat");
  if (what) return t("emergency.form.choosePerson");
  return t("emergency.form.chooseBoth");
}

/** Abre el caso ahora: queda guardado y avisa a Tierra. */
const openNow = (personId: string, name: string, what: WhatCode) =>
  saveCase(openCase(personId, name, what, Date.now()));

/** Vuelve a la pantalla anterior de la app (la Navigation API solo cuenta las
 *  de este sitio); si se llegó directo o el navegador no la tiene, a Inicio. */
function cancel() {
  const nav = (window as { navigation?: { canGoBack?: boolean } }).navigation;
  if (nav?.canGoBack) window.history.back();
  else navigate("/");
}

export function OpenCaseForm() {
  const [personId, setPersonId] = useState(() =>
    presetPerson(window.location.search, CREW_IDS),
  );
  const [what, setWhat] = useState<WhatCode | null>(null);
  const person = CREW.find((c) => c.id === personId);

  const open = () => {
    if (person && what) openNow(person.id, person.name, what);
  };

  return (
    <div className="em-page">
      <p className="em-banner em-banner--form">
        <Siren aria-hidden="true" />
        {t("emergency.form.alert")}
      </p>

      <div className="em-form">
        <section aria-labelledby="em-who">
          <h2 id="em-who" className="em-section-title">
            {t("emergency.form.who")}
          </h2>
          <div className="em-choices">
            {CREW.map((c) => (
              <button
                key={c.id}
                type="button"
                data-person={c.id}
                aria-pressed={c.id === personId}
                onClick={() => setPersonId(c.id)}
                className="em-choice em-tap"
              >
                <span>
                  {c.name}
                  <small>{c.role}</small>
                </span>
                {c.id === personId && <Check aria-hidden="true" />}
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="em-what">
          <h2 id="em-what" className="em-section-title">
            {t("emergency.form.what")}
          </h2>
          <div className="em-choices em-choices--what">
            {WHAT_HAPPENED.map((w) => (
              <button
                key={w}
                type="button"
                data-what={w}
                aria-pressed={w === what}
                onClick={() => setWhat(w)}
                className="em-choice em-tap"
              >
                <span>{t(`emergency.what.${w}`)}</span>
                {w === what && <Check aria-hidden="true" />}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="em-actions">
        <button
          type="button"
          data-open-case
          onClick={open}
          disabled={!person || !what}
          className="em-open em-tap"
        >
          {openLabel(person?.name, what)}
        </button>
        <button type="button" onClick={cancel} className="em-secondary em-tap">
          {t("common.actions.cancel")}
        </button>
      </div>
    </div>
  );
}
