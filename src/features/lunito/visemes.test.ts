import { expect, test } from "vitest";
import type { Locale } from "@/i18n";
import { mouthAt, soundsOf, timelineOf, VISEMES } from "./visemes";

const shapes = (text: string, locale: Locale = "es") =>
  soundsOf(text, locale).map((s) => s.shape?.replace("viseme_", "") ?? "_");

test("cada letra da el sonido de la tabla de LUNITO-ARTE", () => {
  expect(shapes("mapa")).toEqual(["PP", "aa", "PP", "aa"]);
  expect(shapes("foca")).toEqual(["FF", "O", "DD", "aa"]);
  expect(shapes("luna")).toEqual(["DD", "U", "DD", "aa"]);
  expect(shapes("si")).toEqual(["DD", "I"]);
  expect(shapes("pez")).toEqual(["PP", "E", "DD"]);
});

test("los acentos y las mayúsculas no cambian el sonido", () => {
  expect(shapes("Está")).toEqual(shapes("esta"));
  expect(shapes("ñu")).toEqual(["DD", "U"]);
});

test("ch y ll son un solo sonido; h, qu y gue no suenan de más", () => {
  expect(shapes("chile")).toEqual(["I", "I", "DD", "E"]);
  expect(shapes("llave")).toEqual(["I", "aa", "FF", "E"]);
  expect(shapes("hola")).toEqual(["O", "DD", "aa"]);
  expect(shapes("que")).toEqual(["DD", "E"]);
  expect(shapes("guia")).toEqual(["DD", "I", "aa"]);
  expect(shapes("agua")).toEqual(["aa", "DD", "U", "aa"]);
  expect(shapes("perro")).toEqual(["PP", "E", "DD", "O"]);
});

test("los espacios y la puntuación son pausas, sin repetirse ni sobrar", () => {
  expect(shapes("  Hola,  Ana. ")).toEqual([
    "O",
    "DD",
    "aa",
    "_",
    "aa",
    "DD",
    "aa",
  ]);
  const [, , , comma] = soundsOf("ola, a", "es");
  const [, , , space] = soundsOf("ola a", "es");
  expect(comma!.weight).toBeGreaterThan(space!.weight);
});

test("un número se mueve como varias sílabas", () => {
  expect(shapes("7")).toEqual(["DD", "E", "DD", "O"]);
});

test("la línea de tiempo cubre de 0 a 1 sin huecos", () => {
  const timeline = timelineOf("Hola, Ana. ¿Hacemos tu check-in?", "es");
  expect(timeline[0]!.start).toBe(0);
  expect(timeline.at(-1)!.end).toBeCloseTo(1);
  for (let i = 1; i < timeline.length; i++)
    expect(timeline[i]!.start).toBeCloseTo(timeline[i - 1]!.end);
  expect(timelineOf("...", "es")).toEqual([]);
});

test("las vocales duran más que las consonantes", () => {
  const [m, a] = timelineOf("ma", "es");
  expect(a!.end - a!.start).toBeGreaterThan(m!.end - m!.start);
});

test("la boca toma la forma del sonido que suena", () => {
  const timeline = timelineOf("ma", "es");
  const lips = mouthAt(timeline, timeline[0]!.end * 0.9);
  expect(lips.viseme_PP).toBeCloseTo(1);
  const open = mouthAt(timeline, 0.99);
  expect(open.viseme_aa).toBeCloseTo(1);
  expect(open.viseme_PP).toBeCloseTo(0);
});

test("pasa de una forma a la siguiente sin saltos", () => {
  const timeline = timelineOf("ma", "es");
  const edge = timeline[1]!.start;
  const before = mouthAt(timeline, edge - 1e-6);
  const after = mouthAt(timeline, edge + 1e-6);
  for (const key of VISEMES)
    expect(Math.abs(before[key] - after[key])).toBeLessThan(0.01);
  const mid = mouthAt(timeline, edge + (1 - edge) * 0.2);
  expect(mid.viseme_PP).toBeGreaterThan(0);
  expect(mid.viseme_aa).toBeGreaterThan(0);
  expect(mid.viseme_PP + mid.viseme_aa).toBeCloseTo(1);
});

test("antes, después y sin texto la boca queda cerrada", () => {
  const timeline = timelineOf("hola", "es");
  for (const pose of [
    mouthAt(timeline, -0.1),
    mouthAt(timeline, 1),
    mouthAt([], 0.5),
  ])
    expect(Object.values(pose).every((w) => w === 0)).toBe(true);
});

test("reutiliza el objeto de salida y lo limpia", () => {
  const timeline = timelineOf("ma", "es");
  const out = mouthAt(timeline, 0.99);
  expect(mouthAt(timeline, 0.05, out)).toBe(out);
  expect(out.viseme_aa).toBe(0);
});

// ---------- Inglés ----------

const en = (text: string) => shapes(text, "en");

test("en inglés, th, sh, ch, ph, ck y ng son un solo sonido", () => {
  expect(en("think")).toEqual(["DD", "I", "DD", "DD"]);
  expect(en("she")).toEqual(["I", "E"]);
  expect(en("chat")).toEqual(["I", "aa", "DD"]);
  expect(en("phone")).toEqual(["FF", "O", "DD"]);
  expect(en("back")).toEqual(["PP", "aa", "DD"]);
  expect(en("sing")).toEqual(["DD", "I", "DD"]);
  expect(en("night")).toEqual(["DD", "I", "DD"]);
});

test("en inglés, las vocales dobles toman la forma de su sonido", () => {
  expect(en("see")).toEqual(["DD", "I"]);
  expect(en("moon")).toEqual(["PP", "U", "DD"]);
  expect(en("day")).toEqual(["DD", "E"]);
  expect(en("boat")).toEqual(["PP", "O", "DD"]);
  // Un diptongo pasa por dos formas, más cortas que una vocal sola.
  const [, o, u] = soundsOf("now", "en");
  expect([o!.shape, u!.shape]).toEqual(["viseme_O", "viseme_U"]);
  expect(o!.weight).toBeLessThan(soundsOf("no", "en")[1]!.weight);
});

test("en inglés, la e muda del final no suena (en palabras cortas sí)", () => {
  expect(en("make")).toEqual(["PP", "aa", "DD"]);
  expect(en("time")).toEqual(["DD", "I", "PP"]);
  expect(en("the")).toEqual(["DD", "E"]);
  expect(en("free")).toEqual(["FF", "DD", "I"]);
});

test("en inglés, w redondea, u cerrada abre y las consonantes dobles son una", () => {
  expect(en("we")).toEqual(["U", "E"]);
  expect(en("up")).toEqual(["aa", "PP"]);
  expect(en("much")).toEqual(["PP", "aa", "I"]);
  expect(en("hello")).toEqual(["E", "DD", "O"]);
  expect(en("yes")).toEqual(["I", "E", "DD"]);
  expect(en("happy")).toEqual(["aa", "PP", "I"]);
  expect(en("I'm")).toEqual(["I", "PP"]);
});

test("el mismo texto se mueve distinto según el idioma", () => {
  expect(shapes("chile", "es")).toEqual(["I", "I", "DD", "E"]);
  expect(shapes("chile", "en")).toEqual(["I", "I", "DD"]);
  expect(shapes("llave", "es")[0]).toBe("I");
  expect(shapes("llave", "en")[0]).toBe("DD");
});

test("en inglés, la línea de tiempo también cubre de 0 a 1 con sus pausas", () => {
  const text = "Hi, Ana. Shall we do your check-in?";
  const timeline = timelineOf(text, "en");
  expect(timeline[0]!.start).toBe(0);
  expect(timeline.at(-1)!.end).toBeCloseTo(1);
  for (let i = 1; i < timeline.length; i++)
    expect(timeline[i]!.start).toBeCloseTo(timeline[i - 1]!.end);
  expect(en("Hi, Ana.")).toEqual(["I", "_", "aa", "DD", "aa"]);
});
