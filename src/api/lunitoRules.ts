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

// Regla de enrutamiento, no umbral clínico: solo decide cuándo Lunito deja de
// conversar y manda al botón Emergencia, que siempre pulsa una persona. Cubre
// las formas naturales de las situaciones de "¿Qué pasó?" (SISTEMA.md §7.5:
// desmayo, dolor de pecho, falta de aire, golpe fuerte) y las que nadie
// dudaría en llamar emergencia: infarto, convulsión, sangrado abundante,
// atragantamiento e inconsciencia. El texto llega sin acentos ni mayúsculas.
const EMERGENCY_PATTERNS = [
  // Español
  /\bemergencia\b/,
  // Desmayo e inconsciencia
  /\bdesmay/,
  /\binconsciente\b/,
  /\bperdi\w* el conocimiento\b/,
  /\bno (responde|reacciona|respira|despierta)\b/,
  // Dolor de pecho
  /\b(dolor|opresion|presion) (en el|en mi|de|del) pecho\b/,
  /\bduelen? (mucho |bastante )?el pecho\b/,
  /\bpecho me duele\b/,
  // Falta de aire. Respirar mal por la nariz es congestión, no emergencia.
  /\bno (puedo|puede|podia|pude|pudo) respirar\b(?! (bien )?por la nariz)/,
  /\b(me|le|te) cuesta (mucho )?respirar\b/,
  /\bdificultad para respirar\b/,
  /\b(me ahogo|se ahoga|se esta ahogando|me estoy ahogando)\b/,
  /\b(me|le|te|nos) falta (el )?aire\b/,
  /\bfalta de aire\b/,
  // Golpe fuerte
  /\bgolpe (muy )?(fuerte|en la cabeza)\b/,
  /\b(me|te|se|le) (golpe\w*|pegu?e|pego) (muy )?(fuerte|(en |con )?la cabeza)\b/,
  // Infarto, convulsión, sangrado abundante y atragantamiento
  /\binfarto\b/,
  /\bataque (al corazon|cardiaco)\b/,
  /\bconvulsi/,
  /\bsangr(a|ando|o) (mucho|muchisimo|bastante|sin parar)\b/,
  /\bsangrado (abundante|fuerte|grave)\b/,
  /\bno (para|deja) de sangrar\b/,
  /\bmucha sangre\b/,
  /\bhemorragia\b/,
  /\batragant/,
  // Inglés
  /\bemergency\b/,
  // Desmayo e inconsciencia. "Faint" solo como estado: "a faint headache" o
  // "faint-hearted" no son un desmayo.
  /\b(passed|passing|blacked|blacking) out\b/,
  /\b(going to|gonna|about to|might|may|could|will|i'll) pass out\b/,
  /\bfaint(ed|ing)\b/,
  /\b(feel|feels|felt|feeling|getting|going to|gonna|about to|might|may|could|will) (a (little|bit) |a bit |kind of |kinda |so |very |really |pretty |quite )?faint(?![\w-])/,
  /\bcollapsed\b/,
  /\b(unconscious|unresponsive)\b/,
  /\blost consciousness\b/,
  /\b(not|isn't|aren't|wasn't|stopped) (responding|breathing)\b/,
  /\b(doesn't|does not|won't|will not) (respond|wake up)\b/,
  // Dolor de pecho
  /\bchest (pains?|pressure|tightness|hurts?|hurting|is (hurting|tight)|feels (tight|heavy))\b/,
  /\b(pains?|pressure|tightness) in (my|his|her|their|the) chest\b/,
  // Falta de aire. Por la nariz es congestión.
  /\b(can't|cant|cannot|can not|couldn't|couldnt) breathe\b(?! through (my|the|his|her) nose)/,
  /\b(hard|difficult) to breathe\b/,
  /\b(trouble|difficulty|struggling) (breathing|to breathe)\b/,
  /\bshort(ness)? of breath\b/,
  /\bcan't catch (my|his|her|their) breath\b/,
  // Golpe fuerte
  /\b(hit|bumped|banged|smacked|knocked|struck) (my|his|her|their) head\b/,
  /\b(hard|bad) (hit|blow|knock)\b/,
  /\bhead (injury|trauma)\b/,
  // Infarto, convulsión, sangrado abundante y atragantamiento
  /\bheart attack\b/,
  /\bcardiac arrest\b/,
  /\bseizures?\b/,
  /\bconvuls/,
  /\bbleeding (a lot|heavily|badly|profusely|nonstop|non-stop|everywhere)\b/,
  /\bheavy bleeding\b/,
  /\b(won't|will not|doesn't|does not|can't) stop bleeding\b/,
  /\blots? of blood\b/,
  /\bchok(e|es|ed|ing)\b(?! hazards?)/,
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

/** Lo que Lunito dice ante una emergencia: al botón y al oficial médico. */
export function emergencyLine(
  ctx: Pick<LunitoContext, "name" | "cmoName">,
  locale: Locale,
): string {
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

// Enfermedades y malestares que, dichos de la persona, son un diagnóstico.
// Una sola lista para los dos idiomas: la IA puede mezclarlos.
const CONDITIONS = [
  // Inglés
  "infection",
  "fever",
  // Con artículo: "it's cold" es la temperatura, "a cold" es un resfriado.
  "a cold",
  "flu",
  "migraine",
  "virus",
  "concussion",
  "condition",
  "disease",
  "disorder",
  "illness",
  "syndrome",
  "insomnia",
  "anxiety",
  "depression",
  "dehydration",
  "hypoxia",
  "anemia",
  "sprain",
  "fracture",
  "hypertension",
  "panic attack",
  // Español, sin acentos (así llega el texto)
  "infeccion",
  "fiebre",
  "resfriado",
  "gripe",
  "migrana",
  "conmocion",
  "enfermedad",
  "trastorno",
  "sindrome",
  "insomnio",
  "ansiedad",
  "depresion",
  "deshidratacion",
  "hipoxia",
  "anemia",
  "esguince",
  "fractura",
  "hipertension",
  "ataque de panico",
];

const ARTICLE = String.raw`(?:(?:an?|the|una?|el|la|los|las) )?`;
const CONDITION = String.raw`(?:${CONDITIONS.join("|")})(?:e?s)?\b`;
const diagnosis = (lead: string) =>
  new RegExp(String.raw`\b${lead} ${ARTICLE}${CONDITION}`);

const UNSAFE_PATTERNS = [
  // Español
  /\b\d+([.,]\d+)?\s?(mg|miligramos?|ml|mililitros?|mcg|microgramos?|gramos?|tabletas?|pastillas?|capsulas?|comprimidos?|gotas)\b/,
  /\b(una|dos|tres|cuatro|media|unas|un par de) (pastillas?|tabletas?|capsulas?|comprimidos?|gotas)\b/,
  /\b(pastillas?|tabletas?|capsulas?|medicinas?|medicamentos?|remedios?) (para|contra) (dormir|el|la|los|las)\b/,
  // Raíz del nombre: atrapa el singular, el plural y la forma en inglés.
  /\b(ibuprofeno|paracetamol|acetaminofen|aspirina|naproxeno|diclofenaco|ketorolaco|antibiotic|analgesic|antihistamin|antiemetic|sedante|somnifero|melatonina|morfina|opioide|prometazina|escopolamina|meclizina|dramamina|dimenhidrinato|difenhidramina|loratadina|cetirizina|benzodiacepina)/,
  /\b(padeces|sufres de)\b/,
  diagnosis(
    "(tienes|tendras|puede que tengas|tal vez tengas|quizas? tengas|seguro tienes|seguramente tienes|creo que tienes|podrias tener|es probable que tengas|probablemente (tengas|tienes))",
  ),
  diagnosis(
    "(parecen?|suena a|podria ser|puede ser|puede que sea|tal vez sea|quizas? sea|seguro es|seguramente es|debe (de )?ser|probablemente (sea|es)|es)",
  ),
  // Inglés
  /\b\d+([.,]\d+)?\s?(milligrams?|milliliters?|millilitres?|micrograms?|grams?|tablets?|pills?|capsules?|caplets?|drops|doses?|puffs?)\b/,
  /\b(one|two|three|four|a|an|half an?|a couple of|a few|some|another) (pills?|tablets?|capsules?|caplets?)\b/,
  /\b(motion sickness|sleeping|sleep|pain|allergy|nausea|anxiety) (pills?|medicines?|medications?|meds|tablets?)\b/,
  // Palabra completa (con plural): "ambien" no debe atrapar "ambiente".
  /\b(ibuprofen|acetaminophen|tylenol|advil|motrin|aleve|naproxen|aspirin|diclofenac|ketorolac|painkiller|pain reliever|sedative|sleeping pill|sleep aid|melatonin|morphine|opioid|promethazine|scopolamine|meclizine|dramamine|dimenhydrinate|diphenhydramine|loratadine|cetirizine|benadryl|zolpidem|ambien|modafinil)s?\b/,
  /\b(you're|you are|you) (suffering|suffer) from\b/,
  // "You have" o "you must have" a secas son lenguaje normal ("you have your
  // check-in pending", "you must have had a long day"): solo cuentan seguidos
  // del nombre de una enfermedad o un malestar.
  diagnosis("you( (may|might|could|probably|likely|must))?( have|'ve)( got)?"),
  diagnosis("(sounds|seems|looks) like( you( have|'ve)( got)?)?"),
  diagnosis(
    "((could|might|may|must|will) (probably |likely |definitely )?be|it's|it is|this is|that's|that is)( probably| likely| definitely)?",
  ),
  // Mencionar el diagnóstico cuenta; negarlo no (ver NEGATED_DIAGNOSIS).
  /\bdiagnos/,
];

// "I can't diagnose", "this isn't a diagnosis", "no puedo diagnosticar", "no
// es un diagnóstico": Lunito dice que no diagnostica, y eso sí puede decirlo.
// La negación va hasta tres palabras antes.
const NEGATED_DIAGNOSIS =
  /(?:\b(?:no|not|never|nunca|ni|sin|cannot|cant|dont|isnt|wont|unable)\b|n't\b)(?: [\w']+){0,3}? diagnos\w*/g;

export const isUnsafe = (text: string) => {
  const t = plain(text).replace(NEGATED_DIAGNOSIS, " ");
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
