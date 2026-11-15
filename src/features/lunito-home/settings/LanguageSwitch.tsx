// Idioma de la app: la única forma de cambiarlo. El inglés es el idioma
// oficial; cada opción se nombra en su propio idioma.
import { Languages } from "lucide-react";
import { useEffect, useRef } from "react";
import { LOCALES, setLocale, t, useLocale, type Locale } from "@/i18n";

const NAMES: Record<Locale, string> = { en: "English", es: "Español" };

// Al cambiar de idioma la app se vuelve a montar. La opción tocada recupera
// el foco al volver, así la persona sigue en el mismo lugar de Configuración.
let returnTo: Locale | null = null;

export function LanguageSwitch() {
  const locale = useLocale();
  const buttons = useRef(new Map<Locale, HTMLButtonElement>());

  useEffect(() => {
    if (!returnTo) return;
    buttons.current.get(returnTo)?.focus();
    returnTo = null;
  }, []);

  return (
    <div className="settings-row settings-language">
      <Languages aria-hidden="true" strokeWidth={1.7} />
      <span className="settings-row-text">
        <strong id="settings-language">{t("settings.language.title")}</strong>
      </span>
      <fieldset
        aria-labelledby="settings-language"
        className="settings-segmented"
      >
        {LOCALES.map((option) => (
          <button
            key={option}
            type="button"
            lang={option}
            aria-pressed={option === locale}
            ref={(button) => {
              if (button) buttons.current.set(option, button);
              else buttons.current.delete(option);
            }}
            onClick={() => {
              if (option === locale) return;
              returnTo = option;
              setLocale(option);
            }}
          >
            {NAMES[option]}
          </button>
        ))}
      </fieldset>
    </div>
  );
}
