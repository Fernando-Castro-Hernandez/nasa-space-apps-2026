// De lo que Lunito va a decir a la forma de su boca en cada instante
// (LUNITO-ARTE.md §3 y §10). El español se pronuncia como se escribe: cada
// letra da un sonido. El inglés no: primero se leen sus grupos de letras más
// comunes (th, sh, ee, oo…) y se calla la "e" muda del final. No es fonética
// exacta; basta con que la boca se vea creíble. Los sonidos se reparten a lo
// largo del audio. Función pura: no sabe de audio ni de three.js.
import type { Locale } from "@/i18n";

/** Shape keys de `mouth` para hablar; los nombres son los del modelo. */
export const VISEMES = [
  "viseme_PP",
  "viseme_FF",
  "viseme_DD",
  "viseme_aa",
  "viseme_E",
  "viseme_I",
  "viseme_O",
  "viseme_U",
] as const;
export type Viseme = (typeof VISEMES)[number];

/** Cuánto pesa cada forma, de 0 a 1. Todo en 0 es la sonrisa cerrada. */
export type MouthPose = Record<Viseme, number>;

/** Un sonido (o una pausa, con `shape` null) y su tramo del audio, de 0 a 1. */
export type Segment = { shape: Viseme | null; start: number; end: number };

export const restPose = (): MouthPose => ({
  viseme_PP: 0,
  viseme_FF: 0,
  viseme_DD: 0,
  viseme_aa: 0,
  viseme_E: 0,
  viseme_I: 0,
  viseme_O: 0,
  viseme_U: 0,
});

// Tabla de LUNITO-ARTE.md §3.
const SOUNDS: Record<string, Viseme> = {
  a: "viseme_aa",
  e: "viseme_E",
  i: "viseme_I",
  y: "viseme_I",
  o: "viseme_O",
  u: "viseme_U",
  m: "viseme_PP",
  b: "viseme_PP",
  p: "viseme_PP",
  f: "viseme_FF",
  v: "viseme_FF",
};
const CONSONANT: Viseme = "viseme_DD";

// Duración relativa de cada sonido: las vocales se sostienen, las consonantes
// son un toque y la puntuación es una pausa.
const VOWEL = 1;
const TOUCH = 0.55;
const PAUSE = { space: 0.35, comma: 1.2, stop: 1.8 } as const;

type Sound = { shape: Viseme | null; weight: number };

const isVowel = (c: string | undefined) =>
  c !== undefined && "aeiou".includes(c);
const isConsonant = (c: string | undefined) =>
  c !== undefined && c >= "a" && c <= "z" && !isVowel(c);

/** Español: una letra, un sonido; ch, ll, qu, gue/gui y rr cuentan como uno. */
function spanishWord(word: string, out: Sound[]) {
  for (let i = 0; i < word.length; i++) {
    const c = word[i]!;
    const next = word[i + 1];
    if (c === "h") continue; // muda; "ch" se resuelve en la "c"
    if ((c === "c" && next === "h") || (c === "l" && next === "l")) {
      out.push({ shape: "viseme_I", weight: TOUCH });
      i++;
    } else if (
      (c === "q" && next === "u") ||
      (c === "g" && next === "u" && "ei".includes(word[i + 2] ?? "-"))
    ) {
      out.push({ shape: CONSONANT, weight: TOUCH }); // la "u" no suena
      i++;
    } else if (c === "r" && next === "r") {
      out.push({ shape: CONSONANT, weight: TOUCH });
      i++;
    } else {
      out.push({
        shape: SOUNDS[c] ?? CONSONANT,
        weight: isVowel(c) ? VOWEL : TOUCH,
      });
    }
  }
}

// Inglés: pares de consonantes que suenan como uno (o que no suenan).
const EN_CONSONANT_PAIRS: Record<string, Viseme[]> = {
  th: ["viseme_DD"],
  sh: ["viseme_I"],
  ch: ["viseme_I"],
  ph: ["viseme_FF"],
  ck: ["viseme_DD"],
  ng: ["viseme_DD"],
  wh: ["viseme_U"],
  qu: ["viseme_DD", "viseme_U"],
  gh: [], // night, though
};

// Inglés: vocales dobles, con la forma que toman los labios (una o dos).
const EN_VOWEL_PAIRS: Record<string, Viseme[]> = {
  ee: ["viseme_I"],
  ea: ["viseme_I"],
  ie: ["viseme_I"],
  ai: ["viseme_E"],
  ay: ["viseme_E"],
  ei: ["viseme_E"],
  ey: ["viseme_E"],
  oa: ["viseme_O"],
  au: ["viseme_O"],
  aw: ["viseme_O"],
  oo: ["viseme_U"],
  ue: ["viseme_U"],
  ew: ["viseme_U"],
  ou: ["viseme_O", "viseme_U"],
  ow: ["viseme_O", "viseme_U"],
  oi: ["viseme_O", "viseme_I"],
  oy: ["viseme_O", "viseme_I"],
};

// En inglés la "w" redondea los labios y la "j" suena como "ch".
const EN_SOUNDS: Record<string, Viseme> = {
  ...SOUNDS,
  w: "viseme_U",
  j: "viseme_I",
};

function englishWord(word: string, out: Sound[]) {
  // La "e" final tras consonante no suena (make, time, home); en palabras
  // cortas sí (the, be, she).
  const end =
    word.length > 3 && word.endsWith("e") && isConsonant(word.at(-2))
      ? word.length - 1
      : word.length;
  for (let i = 0; i < end; i++) {
    const c = word[i]!;
    const next = i + 1 < end ? word[i + 1] : undefined;
    const pair = `${c}${next ?? ""}`;
    const consonants = EN_CONSONANT_PAIRS[pair];
    const vowels = EN_VOWEL_PAIRS[pair];
    if (consonants) {
      for (const shape of consonants) out.push({ shape, weight: TOUCH });
      i++;
    } else if (vowels) {
      const weight = vowels.length === 1 ? VOWEL : VOWEL * 0.6;
      for (const shape of vowels) out.push({ shape, weight });
      i++;
    } else if (c === next && isConsonant(c)) {
      out.push({ shape: EN_SOUNDS[c] ?? CONSONANT, weight: TOUCH }); // ll, ss, tt
      i++;
    } else if (c === "h") {
      continue; // casi no mueve la boca: manda la vocal que sigue
    } else if (c === "y") {
      // "yes", "you": consonante; "my", "happy": vocal.
      const consonant = i === 0 && isVowel(next);
      out.push({ shape: "viseme_I", weight: consonant ? TOUCH : VOWEL });
    } else if (
      c === "u" &&
      isConsonant(next) &&
      (word[i + 2] === undefined || isConsonant(word[i + 2]))
    ) {
      out.push({ shape: "viseme_aa", weight: VOWEL }); // up, but, much
    } else {
      out.push({
        shape: EN_SOUNDS[c] ?? CONSONANT,
        weight: isVowel(c) ? VOWEL : TOUCH,
      });
    }
  }
}

/** Los sonidos del texto, en orden, con su duración relativa. */
export function soundsOf(text: string, locale: Locale): Sound[] {
  const clean = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/(?<=[a-z])['’](?=[a-z])/g, ""); // don't, I'm: una sola palabra
  const word = locale === "en" ? englishWord : spanishWord;
  const sounds: Sound[] = [];
  const pause = (weight: number) => {
    const last = sounds.at(-1);
    if (!last) return;
    if (last.shape === null) last.weight = Math.max(last.weight, weight);
    else sounds.push({ shape: null, weight });
  };

  for (const [token] of clean.matchAll(/[a-z]+|./gs)) {
    if (isVowel(token[0]) || isConsonant(token[0])) word(token, sounds);
    else if (/[0-9]/.test(token)) {
      // Un número se dice con varias sílabas: "7" es "sie-te" o "se-ven".
      sounds.push(
        { shape: CONSONANT, weight: TOUCH },
        { shape: "viseme_E", weight: VOWEL },
        { shape: CONSONANT, weight: TOUCH },
        { shape: "viseme_O", weight: VOWEL },
      );
    } else if (/[.!?…]/.test(token)) pause(PAUSE.stop);
    else if (/[,;:]/.test(token)) pause(PAUSE.comma);
    else if (/\s/.test(token)) pause(PAUSE.space);
  }
  while (sounds.at(-1)?.shape === null) sounds.pop();
  return sounds;
}

/** Reparte los sonidos del texto a lo largo del audio (de 0 a 1). */
export function timelineOf(text: string, locale: Locale): Segment[] {
  const sounds = soundsOf(text, locale);
  const total = sounds.reduce((sum, s) => sum + s.weight, 0);
  let at = 0;
  return sounds.map((sound) => {
    const start = at / total;
    at += sound.weight;
    return { shape: sound.shape, start, end: at / total };
  });
}

/** Parte de cada sonido que se usa para pasar desde la forma anterior. */
const BLEND = 0.45;
const smooth = (x: number) => x * x * (3 - 2 * x);

/**
 * Forma de la boca cuando el audio va en `progress` (de 0 a 1). Pasa de una
 * forma a la siguiente sin saltos. Escribe en `out` para no crear objetos en
 * cada frame.
 */
export function mouthAt(
  timeline: Segment[],
  progress: number,
  out: MouthPose = restPose(),
): MouthPose {
  for (const key of VISEMES) out[key] = 0;
  if (timeline.length === 0 || progress < 0 || progress >= 1) return out;

  let low = 0;
  let high = timeline.length - 1;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (timeline[mid]!.end <= progress) low = mid + 1;
    else high = mid;
  }
  const current = timeline[low]!;
  const previous = timeline[low - 1];
  const local = (progress - current.start) / (current.end - current.start);
  const k = smooth(Math.min(1, local / BLEND));
  if (previous?.shape) out[previous.shape] += 1 - k;
  if (current.shape) out[current.shape] += k;
  return out;
}
