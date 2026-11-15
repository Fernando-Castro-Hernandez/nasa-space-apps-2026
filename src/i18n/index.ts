// Idioma de la app. El inglés es el idioma oficial (DECISIONS.md); el español
// se elige en Configuración y se recuerda en este dispositivo.
//
// Cómo se usa:
//   t("home.today.title")                    texto en el idioma activo
//   t("team.sheet.sharedBy", { name })       con huecos {name}
//   tn("tasks.done", 2)                      con plural (one / other)
//
// `t` funciona en componentes y en funciones puras: al cambiar de idioma,
// `LocaleRoot` vuelve a montar la app, así que todo se recalcula. Por eso los
// textos no se guardan en constantes de módulo: se piden al momento de usarse.
import { persistedStore } from "@/data/persisted";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_TAG,
  translate,
  translatePlural,
  type Locale,
  type MessageKey,
  type Params,
  type PluralKey,
} from "./translate";

export { LOCALES, DEFAULT_LOCALE, LOCALE_TAG, isLocale } from "./translate";
export type { Locale, MessageKey, PluralKey, Params } from "./translate";

// Idioma cuando no hay ninguno guardado. Las pruebas lo fijan en español
// (src/test/setup.ts) porque sus aserciones leen los textos en español.
let fallback: Locale = DEFAULT_LOCALE;

// null: no hay idioma guardado (o el guardado ya no existe).
const store = persistedStore<Locale | null>(
  "nostos.locale",
  (raw) => (isLocale(raw) ? raw : null),
  String,
);

export const getLocale = (): Locale => store.get() ?? fallback;
export const setLocale = (locale: Locale) => store.set(locale);
/** Idioma activo; el componente se actualiza si cambia. */
export const useLocale = (): Locale => store.use() ?? fallback;

/** Solo para pruebas: el idioma cuando no hay uno guardado. */
export function setFallbackLocale(locale: Locale) {
  fallback = locale;
}

/** Texto de `key` en el idioma activo. */
export const t = (key: MessageKey, params?: Params) =>
  translate(getLocale(), key, params);

/** Texto con plural en el idioma activo; `{count}` ya viene incluido. */
export const tn = (key: PluralKey, count: number, params?: Params) =>
  translatePlural(getLocale(), key, count, params);

/** Etiqueta BCP 47 del idioma activo ("en-US", "es-MX"). */
export const localeTag = () => LOCALE_TAG[getLocale()];

/** Número con el formato del idioma activo. */
export const formatNumber = (
  value: number,
  options?: Intl.NumberFormatOptions,
) => new Intl.NumberFormat(localeTag(), options).format(value);

/** Fecha u hora con el formato del idioma activo. */
export const formatDate = (
  date: Date | number,
  options: Intl.DateTimeFormatOptions,
) => new Intl.DateTimeFormat(localeTag(), options).format(date);
