import { afterEach, expect, test } from "vitest";
import { getLocale, setFallbackLocale, setLocale, t, tn } from "./index";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { translate, translatePlural, type MessageKey } from "./translate";

afterEach(() => {
  window.localStorage.clear();
  setFallbackLocale("es");
});

const holes = (text: string) => (text.match(/\{\w+\}/g) ?? []).toSorted();

/** Todas las claves de un árbol, como rutas con puntos. */
function keysOf(tree: object, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string"
      ? [`${prefix}${key}`]
      : keysOf(value as object, `${prefix}${key}.`),
  );
}

test("el inglés es el idioma oficial cuando no hay uno guardado", () => {
  setFallbackLocale("en");
  expect(getLocale()).toBe("en");
  expect(t("common.status.verde")).toBe("Good");
});

test("el idioma elegido se recuerda y cambia los textos", () => {
  setLocale("es");
  expect(window.localStorage.getItem("nostos.locale")).toBe("es");
  expect(t("common.status.ambar")).toBe("Precaución");
  setLocale("en");
  expect(t("common.status.ambar")).toBe("Caution");
});

test("un idioma guardado que no existe cae al oficial", () => {
  setFallbackLocale("en");
  window.localStorage.setItem("nostos.locale", "fr");
  expect(getLocale()).toBe("en");
});

test("rellena los huecos y deja intactos los que no recibe", () => {
  expect(translate("en", "common.missionDay", { day: 142 })).toBe("Day 142");
  expect(translate("es", "common.missionDay", { day: 142 })).toBe("Día 142");
  expect(translate("en", "common.missionDay")).toBe("Day {day}");
});

test("elige el plural según la cantidad", () => {
  expect(translatePlural("en", "common.minutes", 1)).toBe("1 minute");
  expect(translatePlural("en", "common.minutes", 5)).toBe("5 minutes");
  expect(translatePlural("es", "common.minutes", 1)).toBe("1 minuto");
  setLocale("es");
  expect(tn("common.minutes", 0)).toBe("0 minutos");
});

test("una clave que no existe se muestra tal cual, sin romper la pantalla", () => {
  expect(translate("es", "no.existe" as MessageKey)).toBe("no.existe");
});

test("el español tiene exactamente las mismas claves que el inglés", () => {
  expect(keysOf(es).toSorted()).toEqual(keysOf(en).toSorted());
});

test("ningún texto quedó vacío en ninguno de los dos idiomas", () => {
  for (const [name, tree] of [
    ["en", en],
    ["es", es],
  ] as const)
    for (const key of keysOf(tree))
      expect(
        translate(name, key as MessageKey).trim(),
        `${name}: ${key}`,
      ).not.toBe("");
});

test("los huecos {x} son los mismos en los dos idiomas", () => {
  for (const key of keysOf(en) as MessageKey[])
    expect(holes(translate("es", key)), key).toEqual(
      holes(translate("en", key)),
    );
});
