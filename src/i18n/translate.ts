// Traducción pura: de una clave y un idioma a un texto. Sin React ni
// almacenamiento, para que también la use el Worker (que recibe el idioma en
// cada petición). El inglés es el idioma oficial y la fuente de las claves; el
// español debe tener exactamente las mismas (lo exige el tipo `Messages`).
import { en } from "./locales/en";
import { es } from "./locales/es";

export type Locale = "en" | "es";
export const LOCALES: readonly Locale[] = ["en", "es"];
export const DEFAULT_LOCALE: Locale = "en";

export const isLocale = (value: unknown): value is Locale =>
  value === "en" || value === "es";

/** Etiqueta BCP 47 para `Intl`, el dictado y la voz del navegador. */
export const LOCALE_TAG: Record<Locale, string> = {
  en: "en-US",
  es: "es-MX",
};

/** El mismo árbol que el diccionario en inglés, con texto en cada hoja. */
export type Messages<T> = {
  [K in keyof T]: T[K] extends string ? string : Messages<T[K]>;
};

type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

type Plurals<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? never
    : T[K] extends { other: string }
      ? `${P}${K}`
      : Plurals<T[K], `${P}${K}.`>;
}[keyof T & string];

/** Clave de un texto: "home.today.title". */
export type MessageKey = Leaves<typeof en>;
/** Clave de un texto con plural: un objeto con `one` y `other`. */
export type PluralKey = Plurals<typeof en>;
export type Params = Record<string, string | number>;

const DICTIONARIES: Record<Locale, Messages<typeof en>> = { en, es };

function lookup(tree: unknown, key: string): string | undefined {
  let node = tree;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

const fill = (text: string, params?: Params) =>
  params
    ? text.replace(/\{(\w+)\}/g, (hole, name: string) =>
        name in params ? String(params[name]) : hole,
      )
    : text;

/** Texto de `key` en `locale`. `{nombre}` se reemplaza con `params.nombre`. */
export function translate(
  locale: Locale,
  key: MessageKey,
  params?: Params,
): string {
  const text = lookup(DICTIONARIES[locale], key) ?? lookup(en, key) ?? key;
  return fill(text, params);
}

const pluralRules: Partial<Record<Locale, Intl.PluralRules>> = {};

/**
 * Texto según la cantidad: usa `key.one` u `key.other` (y `zero`, `two`, `few`
 * o `many` si el diccionario los define). `{count}` ya viene incluido.
 */
export function translatePlural(
  locale: Locale,
  key: PluralKey,
  count: number,
  params?: Params,
): string {
  const rules = (pluralRules[locale] ??= new Intl.PluralRules(
    LOCALE_TAG[locale],
  ));
  const form = `${key}.${rules.select(count)}`;
  const text =
    lookup(DICTIONARIES[locale], form) ??
    lookup(DICTIONARIES[locale], `${key}.other`) ??
    lookup(en, `${key}.other`) ??
    key;
  return fill(text, { count, ...params });
}
