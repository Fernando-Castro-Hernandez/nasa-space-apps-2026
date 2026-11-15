import { expect, test } from "vitest";
import type { LunitoContext } from "./contract";
import {
  cleanReply,
  detectEmergency,
  emergencyReply,
  fallbackReply,
  greeting,
  isUnsafe,
  REPLY_MAX_CHARS,
  stateLine,
} from "./lunitoRules";

const ana: LunitoContext = {
  name: "Ana",
  status: "ambar",
  reason: "Variabilidad: bajo tu normal, descansa",
  pendingActions: ["Respiración guiada · 5 min"],
  checkInDone: false,
  missionDay: 142,
  cmoName: "Luis",
};

test("reconoce las situaciones del botón Emergencia, con o sin acentos", () => {
  for (const message of [
    "Omar se desmayó",
    "creo que es una EMERGENCIA",
    "me duele el pecho",
    "siento dolor en el pecho",
    "no puedo respirar bien",
    "Mei no responde",
    "le cuesta respirar",
    "se dio un golpe fuerte en la cabeza",
  ]) {
    expect(detectEmergency(message), message).toBe(true);
  }
});

test("una plática normal no dispara la emergencia", () => {
  for (const message of [
    "dormí mal y me duele un poco la cabeza",
    "¿cómo estoy hoy?",
    "respira conmigo un rato",
    "no puedo dormir",
  ]) {
    expect(detectEmergency(message), message).toBe(false);
  }
});

test("ante una emergencia manda al botón y al oficial médico", () => {
  const reply = emergencyReply(ana, "es");
  expect(reply.source).toBe("reglas");
  expect(reply.suggest).toBe("emergencia");
  expect(reply.text).toContain("Emergencia");
  expect(reply.text).toContain("Luis");
});

test("al oficial médico no le pide avisarse a sí mismo", () => {
  const luis = { ...ana, name: "Luis" };
  expect(emergencyReply(luis, "es").text).not.toContain("avisa a Luis");
  expect(stateLine({ ...luis, status: "rojo" }, "es")).toContain(
    "Repite la medición",
  );
});

test("el estado siempre va con su palabra y su motivo", () => {
  expect(stateLine(ana, "es")).toBe(
    "Hoy tu estado es Precaución. Variabilidad: bajo tu normal, descansa. ¿Hacemos tu check-in?",
  );
  expect(greeting({ ...ana, status: "verde", reason: null }, "es")).toBe(
    "Hola, Ana. Hoy tu estado es Bien: tus indicadores están en tu normal. ¿Hacemos tu check-in?",
  );
});

test("con el check-in hecho propone la siguiente acción pendiente", () => {
  const done = { ...ana, checkInDone: true };
  expect(stateLine(done, "es")).toContain(
    "Te propongo esto: Respiración guiada · 5 min.",
  );
  expect(stateLine({ ...done, pendingActions: [] }, "es")).toContain(
    "Ya hiciste todo lo de hoy.",
  );
  expect(fallbackReply(done, "es").suggest).toBeNull();
  expect(fallbackReply(ana, "es").suggest).toBe("check-in");
});

test("en Atención manda con el oficial médico, no propone tareas", () => {
  const line = stateLine({ ...ana, status: "rojo", checkInDone: true }, "es");
  expect(line).toContain("Avisa a Luis, tu oficial médico.");
  expect(line).not.toContain("Te propongo");
});

test("descarta dosis, medicamentos y diagnósticos de la IA", () => {
  for (const text of [
    "Tómate 400 mg de ibuprofeno.",
    "Te vendría bien un analgésico.",
    "Toma 2 tabletas y descansa.",
    "Mi diagnóstico es que estás agotada.",
    "Es probable que tengas una infección.",
    "Prueba con melatonina antes de dormir.",
  ]) {
    expect(isUnsafe(text), text).toBe(true);
    expect(cleanReply(text), text).toBeNull();
  }
});

test("deja pasar el lenguaje normal de Lunito", () => {
  for (const text of [
    "Tienes pendiente tu respiración guiada de 5 minutos.",
    "Dormiste 5 horas, menos de lo tuyo. ¿Hacemos tu check-in?",
    "Para el dolor de cabeza abre el Botiquín en Tareas.",
  ]) {
    expect(cleanReply(text), text).toBe(text);
  }
});

test("limpia markdown, emojis, comillas y el prefijo Lunito:", () => {
  expect(cleanReply('Lunito: "**Hola**, Ana 🌙  ¿cómo   sigues?"')).toBe(
    "Hola, Ana ¿cómo sigues?",
  );
  expect(cleanReply("   ")).toBeNull();
  expect(cleanReply(42)).toBeNull();
});

test("recorta respuestas largas en un final de frase", () => {
  const long = `${"Estoy contigo hoy. ".repeat(30)}Fin.`;
  const out = cleanReply(long)!;
  expect(out.length).toBeLessThanOrEqual(REPLY_MAX_CHARS);
  expect(out.endsWith(".")).toBe(true);
});

// ---------- Inglés ----------

const anaEn: LunitoContext = {
  ...ana,
  reason: "Variability: below your normal, rest",
  pendingActions: ["Guided breathing · 5 min"],
};

test("reconoce una emergencia en inglés, con la app en cualquier idioma", () => {
  for (const message of [
    "Omar passed out",
    "I think this is an EMERGENCY",
    "my chest hurts",
    "I have chest pain",
    "there's pressure in my chest",
    "I can't breathe properly",
    "Mei isn’t responding",
    "she's not breathing",
    "it's hard to breathe",
    "he hit his head really hard",
    "Luis fainted",
  ]) {
    expect(detectEmergency(message), message).toBe(true);
  }
});

test("una plática normal en inglés no dispara la emergencia", () => {
  for (const message of [
    "I slept badly and have a slight headache",
    "how am I doing today?",
    "breathe with me for a bit",
    "I can't sleep",
    "my back hurts a little",
  ]) {
    expect(detectEmergency(message), message).toBe(false);
  }
});

test("en inglés, las frases fijas salen del diccionario con las palabras del glosario", () => {
  expect(greeting({ ...anaEn, status: "verde", reason: null }, "en")).toBe(
    "Hi, Ana. Your status today is Good: your readings are within your usual range. Shall we do your check-in?",
  );
  expect(stateLine(anaEn, "en")).toBe(
    "Your status today is Caution. Variability: below your normal, rest. Shall we do your check-in?",
  );
  expect(stateLine({ ...anaEn, checkInDone: true }, "en")).toContain(
    "Here's what I suggest: Guided breathing · 5 min.",
  );
  expect(
    stateLine({ ...anaEn, checkInDone: true, pendingActions: [] }, "en"),
  ).toContain("You've done everything for today.");
  expect(
    stateLine(
      { ...anaEn, status: "rojo", reason: null, checkInDone: true },
      "en",
    ),
  ).toBe(
    "Your status today is Alert. Let Luis, your crew medical officer, know.",
  );
  expect(stateLine({ ...anaEn, name: "Luis", status: "rojo" }, "en")).toContain(
    "Take your measurement again.",
  );
});

test("el motivo de las reglas, que viene en minúscula, empieza su propia frase", () => {
  const reason =
    "heart rate variability (HRV) below your usual range on the 7-day average";
  expect(stateLine({ ...anaEn, reason }, "en")).toBe(
    "Your status today is Caution. Heart rate variability (HRV) below your usual range on the 7-day average. Shall we do your check-in?",
  );
  expect(
    stateLine({ ...ana, reason: "oxígeno en sangre al 90 %" }, "es"),
  ).toContain("Hoy tu estado es Precaución. Oxígeno en sangre al 90 %.");
});

test("en inglés, la emergencia y el respaldo también salen del diccionario", () => {
  const emergency = emergencyReply(anaEn, "en");
  expect(emergency.text).toBe(
    "This could be an emergency. Tap the red Emergency button now and alert Luis, your crew medical officer. I'm right here with you.",
  );
  expect(emergency.suggest).toBe("emergencia");
  expect(emergencyReply({ ...anaEn, name: "Luis" }, "en").text).not.toContain(
    "alert Luis",
  );
  expect(fallbackReply(anaEn, "en").text).toBe(
    "I can't give you a detailed answer right now. Your status today is Caution. Variability: below your normal, rest. Shall we do your check-in?",
  );
});

// ---------- Tablas: emergencia (A1, B1) ----------

// Las formas naturales de las cinco situaciones de "¿Qué pasó?" y las que
// nadie dudaría en llamar emergencia, en los dos idiomas.
const EMERGENCIES = [
  // Se desmayó / inconsciencia
  "me voy a desmayar",
  "Luis perdió el conocimiento",
  "Mei está inconsciente",
  "Omar no despierta",
  "I'm going to pass out",
  "I think I'm going to faint",
  "I feel faint",
  "she collapsed",
  "he's unconscious",
  "Ana lost consciousness",
  // Dolor de pecho
  "tengo dolor de pecho",
  "me duele mucho el pecho",
  "opresión en el pecho",
  "el pecho me duele",
  "I have chest pains",
  "chest pains since this morning",
  "my chest is hurting",
  "tightness in my chest",
  // Le cuesta respirar
  "me falta el aire",
  "le falta aire",
  "me ahogo",
  "i cant breathe",
  "I can't breathe",
  "I'm short of breath",
  "she can't catch her breath",
  "he's struggling to breathe",
  // Golpe fuerte
  "me golpeé la cabeza",
  "se golpeó fuerte",
  "se pegó en la cabeza",
  "un golpe en la cabeza",
  "I bumped my head really hard",
  "she banged her head",
  // Infarto
  "creo que es un infarto",
  "es un ataque al corazón",
  "I think I'm having a heart attack",
  // Convulsión
  "Omar tiene una convulsión",
  "está convulsionando",
  "Luis is having a seizure",
  // Sangrado abundante
  "estoy sangrando mucho",
  "no para de sangrar",
  "hay mucha sangre",
  "I'm bleeding a lot",
  "he's bleeding heavily",
  "heavy bleeding from the arm",
  "it won't stop bleeding",
  // Atragantamiento
  "se está atragantando",
  "me atraganté con la comida",
  "he's choking",
];

test.each(EMERGENCIES)("es emergencia: %s", (message) => {
  expect(detectEmergency(message)).toBe(true);
});

// Plática normal, aunque use palabras parecidas: no manda a Emergencia.
const NOT_EMERGENCIES = [
  "I feel a little faint-hearted about the EVA",
  "I had a faint headache this morning",
  "I'm reading a book about choking hazards",
  // La congestión es un síntoma de la bitácora, no una emergencia.
  "I can't breathe through my nose",
  "no puedo respirar por la nariz",
  "me siento un poco mareado",
  "me sangró un poco la nariz",
  "I'm bleeding a little from a paper cut",
  "my chest feels fine today",
  "I'm out of breath after the workout",
  "Mei me pegó la gripe",
  "tengo congestión y me duele la espalda",
];

test.each(NOT_EMERGENCIES)("no es emergencia: %s", (message) => {
  expect(detectEmergency(message)).toBe(false);
});

// ---------- Tablas: filtro de respuestas (M1, B1) ----------

// Diagnósticos, medicamentos y cantidades: la respuesta de la IA se descarta.
const UNSAFE_REPLIES = [
  "Puede que tengas una infección leve.",
  "Tienes fiebre, descansa un poco.",
  "Parece una migraña. ¿Quieres abrir el Botiquín?",
  "Tal vez sea deshidratación.",
  "Seguro tienes gripe.",
  "Podrías tener una infección.",
  "Probablemente tengas ansiedad.",
  "Es una conmoción, avísale a Mei.",
  "Podrías tomar una pastilla para dormir.",
  "Toma dos pastillas de prometazina.",
  "Toma 2 aspirinas.",
  "Toma dos aspirinas.",
  "La escopolamina ayuda con el mareo.",
  "La meclizina te puede ayudar.",
  "Un medicamento para el mareo te vendría bien.",
  "Try some dramamina.",
  "That sounds like a migraine.",
  "It could be a concussion, tell Mei.",
  "It's probably dehydration.",
  "You must have the flu.",
  "You probably have an infection.",
  "Take your motion sickness medicine.",
  "You may want to take a couple of pills.",
  "Some diphenhydramine could help you sleep.",
];

test.each(UNSAFE_REPLIES)("se descarta: %s", (text) => {
  expect(isUnsafe(text)).toBe(true);
  expect(cleanReply(text)).toBeNull();
});

// Lenguaje normal de Lunito, también cuando dice que no diagnostica.
const SAFE_REPLIES = [
  "I can't diagnose anything, but Mei can help. Want to tell her?",
  "No puedo diagnosticar, pero Mei te puede ayudar.",
  "This isn't a diagnosis, but Mei can take a look.",
  "No es un diagnóstico: avísale a Mei si sigue.",
  "I don't diagnose, but I can keep you company.",
  "You must have had a long day, Ana. Want to do your check-in?",
  "Sounds like you have a busy day ahead.",
  "It could be a long day. Want to start with your check-in?",
  "Tienes razón, Ana. ¿Hacemos tu check-in?",
  "Parece que dormiste poco. ¿Hacemos tu check-in?",
  "Podrías tener tu check-in listo en dos minutos.",
  "I hear you felt a bit faint after the run.",
];

test.each(SAFE_REPLIES)("pasa: %s", (text) => {
  expect(cleanReply(text)).toBe(text);
});

test("las frases fijas de Lunito pasan su propio filtro en los dos idiomas", () => {
  for (const locale of ["en", "es"] as const) {
    const lines = [
      greeting(ana, locale),
      stateLine({ ...ana, checkInDone: true }, locale),
      stateLine({ ...ana, status: "rojo" }, locale),
      stateLine({ ...ana, name: "Luis", status: "rojo" }, locale),
      fallbackReply(ana, locale).text,
      emergencyReply(ana, locale).text,
      emergencyReply({ ...ana, name: "Luis" }, locale).text,
    ];
    for (const line of lines) expect(isUnsafe(line), line).toBe(false);
  }
});

test("descarta dosis, medicamentos y diagnósticos en inglés", () => {
  for (const text of [
    "Take 400 mg of ibuprofen.",
    "Try 2 pills before bed.",
    "Take two tablets and rest.",
    "A painkiller could be useful.",
    "Try some melatonin tonight.",
    "My diagnosis is that you're exhausted.",
    "You may have an infection.",
    "It sounds like you've got the flu.",
    "You have a migraine, Ana.",
    "You're suffering from insomnia.",
  ]) {
    expect(isUnsafe(text), text).toBe(true);
    expect(cleanReply(text), text).toBeNull();
  }
});

test("deja pasar el lenguaje normal de Lunito en inglés", () => {
  for (const text of [
    "You have your guided breathing left for today.",
    "You slept 5 hours, less than usual. Shall we do your check-in?",
    "For the headache, open the Med kit in Tasks.",
    "I hear you, Ana. Your status today is Caution.",
    // Los filtros en inglés no atrapan palabras en español.
    "Busca un ambiente tranquilo para tu respiración.",
  ]) {
    expect(cleanReply(text), text).toBe(text);
  }
});
