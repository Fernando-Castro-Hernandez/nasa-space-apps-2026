// Inicio del día: saludo de Lunito y conversación.
export const dayCheckin = {
  region: "Morning check-in with Lunito",
  lunito: "Lunito",
  // Salida en cualquier momento: pospone el check-in y lleva a Inicio.
  notNow: "Not now",
  // La misma salida con la bitácora ya guardada: el check-in ya cuenta como
  // hecho, así que termina y va a Inicio, igual que el botón del resultado.
  // Corto: cabe en una línea junto a Emergencia a 390 px.
  finish: "Go to Home",
  write: "Type your answer",
  greeting: {
    // Dos exclamaciones, una por línea, como en la referencia 04.
    hello: "Hi!",
    title: "Great to see you",
    caption: "Hi, I'm Lunito",
    // Lo que Lunito dice en voz alta al abrir el check-in.
    speech: "Hi! Great to see you. How are you feeling this morning?",
  },
  question: {
    title: "How are you feeling this morning?",
    caption: "Tell me how you're feeling",
  },
  // Lunito repite lo que entendió y guarda solo; "Change" abre la hoja.
  readback: {
    title: "Got it",
    // {mood} y {stress} son de 1 a 5.
    line: "Got it. Mood {mood} out of 5, stress {stress} out of 5.",
    // Lo que se ve en pantalla (la frase de arriba es la que Lunito dice).
    summary: "Mood {mood} of 5 · stress {stress} of 5",
    change: "Change something",
  },
  mic: {
    talk: "Talk to Lunito",
    stop: "Finish talking",
  },
  // Etiqueta de la transcripción de lo que Lunito va entendiendo.
  heard: "I heard:",
  // Mientras Lunito habla, no es el turno de la persona.
  asking: { caption: "Lunito is asking…" },
  listening: {
    starting: "Getting the microphone ready…",
    caption: "Your turn · I'm listening",
    // Se corta sola al callar; el botón "Finish talking" es por si acaso.
    hint: "I'll stop when you pause",
  },
  thinking: {
    transcribing: "Turning your voice into text…",
    organizing: "Sorting out what you told me…",
  },
  // Sin micrófono ni dictado en este navegador: queda escribir.
  noVoice: "This browser can't listen. Type your answer instead.",
};
