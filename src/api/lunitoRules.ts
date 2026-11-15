// Lo que Lunito dice sin IA y lo que la IA no puede decir (SISTEMA.md §1:
// "la IA habla, las reglas deciden"). Funciones puras que usan el Worker y,
// si no hay conexión, también la app. Las frases salen del diccionario (área
// `lunito`) en el idioma que se pide; los filtros revisan siempre los dos
// idiomas, porque alguien puede hablar español con la app en inglés.
import { LOCALE_TAG, translate, type Locale } from "../i18n/translate";
import type {
  LunitoContext,
  LunitoReplyResponse,
  LunitoSuggestion,
  StatusCode,
} from "./contract";

const plain = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[‘’]/g, "'");

// Las mismas situaciones que ofrece "¿Qué pasó?" al abrir una emergencia
// (SISTEMA.md §7.5). No es una regla clínica: solo decide cuándo Lunito deja
// de conversar y manda al botón Emergencia, que siempre pulsa una persona.
const EMERGENCY_PATTERNS = [
  // Español
  /\bemergencia\b/,
  /\bdesmay/,
  /\binconsciente\b/,
  /\bno (responde|reacciona|respira)\b/,
  /\bno (puedo|puede) respirar\b/,
  /\b(me|le) cuesta respirar\b/,
  /\bdificultad para respirar\b/,
  /\b(me ahogo|se ahoga)\b/,
  /\b(dolor|opresion) (en|de) el pecho\b/,
  /\bduele el pecho\b/,
  /\bgolpe fuerte\b/,
  /\bse golpeo\b/,
  // Inglés
  /\bemergency\b/,
  /\b(passed|blacked) out\b/,
  /\bfaint(ed|ing)?\b/,
  /\bcollapsed\b/,
  /\b(unconscious|unresponsive)\b/,
  /\b(not|isn't|aren't|wasn't|stopped) (responding|breathing)\b/,
  /\b(doesn't|does not|won't|will not) (respond|wake up)\b/,
  /\b(can't|cannot|can not|couldn't) breathe\b/,
  /\b(hard|difficult) to breathe\b/,
  /\b(trouble|difficulty|struggling) breathing\b/,
  /\bchoking\b/,
  /\bchest (pain|pressure|tightness|hurts)\b/,
  /\b(pain|pressure|tightness) in (my|his|her|their|the) chest\b/,
  /\bhit (my|his|her|their) head\b/,
  /\b(hard|bad) (hit|blow|knock)\b/,
];

/** ¿El mensaje habla de una emergencia? En español o en inglés. */
export const detectEmergency = (message: string) => {
  const text = plain(message);
  return EMERGENCY_PATTERNS.some((p) => p.test(text));
};

const statusWord = (status: StatusCode, locale: Locale) =>
  translate(locale, `common.status.${status}`);

/** Los motivos de las reglas empiezan en minúscula ("oxygen at 90%") porque
 *  en pantalla van tras el estado; dichos solos, empiezan una frase. */
const asSentence = (text: string, locale: Locale) =>
  text.charAt(0).toLocaleUpperCase(LOCALE_TAG[locale]) + text.slice(1);

export function emergencyLine(ctx: LunitoContext, locale: Locale): string {
  return ctx.name === ctx.cmoName
    ? translate(locale, "lunito.rules.emergencySelf")
    : translate(locale, "lunito.rules.emergency", { cmo: ctx.cmoName });
}

/** El siguiente paso que proponen las reglas, en una frase. */
function nextStep(ctx: LunitoContext, locale: Locale): string {
  if (ctx.status === "rojo")
    return ctx.name === ctx.cmoName
      ? translate(locale, "lunito.rules.repeatMeasurement")
      : translate(locale, "lunito.rules.tellCmo", { cmo: ctx.cmoName });
  if (!ctx.checkInDone) return translate(locale, "lunito.rules.askCheckIn");
  const action = ctx.pendingActions[0];
  return action
    ? translate(locale, "lunito.rules.suggestAction", { action })
    : translate(locale, "lunito.rules.allDone");
}

/** El estado en palabras, con su motivo y el siguiente paso. */
export function stateLine(ctx: LunitoContext, locale: Locale): string {
  const status = statusWord(ctx.status, locale);
  const state =
    ctx.status === "verde"
      ? translate(locale, "lunito.rules.stateGood")
      : ctx.reason
        ? translate(locale, "lunito.rules.stateWithReason", {
            status,
            reason: asSentence(ctx.reason, locale),
          })
        : translate(locale, "lunito.rules.state", { status });
  return `${state} ${nextStep(ctx, locale)}`;
}

/** Lunito habla primero: lo que dice al abrir Inicio. */
export const greeting = (ctx: LunitoContext, locale: Locale) =>
  `${translate(locale, "lunito.rules.hello", { name: ctx.name })} ${stateLine(ctx, locale)}`;

export const suggestionFor = (ctx: LunitoContext): LunitoSuggestion =>
  ctx.checkInDone ? null : "check-in";

/** Respuesta fija cuando la IA no está o dijo algo que no debe. */
export const fallbackReply = (
  ctx: LunitoContext,
  locale: Locale,
): LunitoReplyResponse => ({
  text: `${translate(locale, "lunito.rules.noDetail")} ${stateLine(ctx, locale)}`,
  source: "reglas",
  suggest: suggestionFor(ctx),
});

export const emergencyReply = (
  ctx: LunitoContext,
  locale: Locale,
): LunitoReplyResponse => ({
  text: emergencyLine(ctx, locale),
  source: "reglas",
  suggest: "emergencia",
});

// Lunito nunca diagnostica, decide tratamientos ni inventa dosis (SISTEMA.md
// §1). Si la IA nombra un medicamento, una dosis o un diagnóstico, su texto se
// descarta: de eso se encarga el Botiquín, con su protocolo ya validado.
const UNSAFE_PATTERNS = [
  // Español
  /\b\d+([.,]\d+)?\s?(mg|miligramos?|ml|mililitros?|mcg|microgramos?|gramos?|tabletas?|pastillas?|capsulas?|comprimidos?|gotas)\b/,
  /\b(ibuprofeno|paracetamol|acetaminofen|aspirina|naproxeno|diclofenaco|ketorolaco|antibiotic|analgesic|antihistamin|sedante|somnifero|melatonina|morfina)/,
  /\bdiagnostic/,
  /\b(padeces|sufres de|podrias tener|es probable que tengas|probablemente tengas)\b/,
  // Inglés
  /\b\d+([.,]\d+)?\s?(milligrams?|milliliters?|millilitres?|micrograms?|grams?|tablets?|pills?|capsules?|caplets?|drops|doses?|puffs?)\b/,
  /\b(one|two|three|four|a|an|half an?) (pills?|tablets?|capsules?|caplets?)\b/,
  // Palabra completa (con plural): "ambien" no debe atrapar "ambiente".
  /\b(ibuprofen|acetaminophen|tylenol|advil|motrin|aleve|naproxen|aspirin|diclofenac|ketorolac|painkiller|pain reliever|sedative|sleeping pill|sleep aid|melatonin|morphine|opioid|promethazine|scopolamine|meclizine|dramamine|benadryl|zolpidem|ambien|modafinil)s?\b/,
  /\bdiagnos/,
  /\byou (may|might|could|probably|likely|must) have\b/,
  /\b(you're|you are|you) (suffering|suffer) from\b/,
  /\b(sounds|seems|looks) like you( have|'ve got)\b/,
  // "You have" a secas es lenguaje normal ("you have your check-in pending"):
  // solo cuenta seguido del nombre de una enfermedad o un malestar.
  /\byou( have|'ve)( got)? (an? )?(infection|fever|cold|flu|migraine|virus|concussion|condition|disease|disorder|illness|syndrome|insomnia|anxiety|depression)\b/,
];

export const isUnsafe = (text: string) => {
  const t = plain(text);
  return UNSAFE_PATTERNS.some((p) => p.test(t));
};

export const REPLY_MAX_CHARS = 300;

/** Corta en el último final de frase que quepa; si no hay, en la última palabra. */
function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const end = Math.max(
    cut.lastIndexOf(". "),
    cut.lastIndexOf("? "),
    cut.lastIndexOf("! "),
  );
  if (end > max * 0.4) return cut.slice(0, end + 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

/**
 * Deja el texto de la IA listo para leerse y decirse en voz alta: sin
 * markdown, emojis ni prefijos, y corto. Devuelve null si queda vacío o si
 * dice algo que Lunito no puede decir.
 */
export function cleanReply(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const text = raw
    .replace(/[*_#`>~|]/g, "")
    .replace(/\p{Extended_Pictographic}|️|‍/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^lunito\s*:\s*/i, "")
    .replace(/^["“”'«]+|["“”'»]+$/g, "")
    .trim();
  if (!text || isUnsafe(text)) return null;
  return clamp(text, REPLY_MAX_CHARS);
}
