// Inicio del día: saludo de Lunito y conversación.
export const dayCheckin = {
  region: "Morning check-in with Lunito",
  lunito: "Lunito",
  // Salida en cualquier momento: pospone el check-in y lleva a Inicio.
  notNow: "Not now",
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
  mic: {
    talk: "Talk to Lunito",
    stop: "Finish talking",
  },
  listening: {
    starting: "Getting the microphone ready…",
    caption: "Listening…",
    hint: "Tap the wave when you're done · {seconds} s left",
  },
  thinking: {
    transcribing: "Turning your voice into text…",
    organizing: "Sorting out what you told me…",
  },
  // Sin micrófono ni dictado en este navegador: queda escribir.
  noVoice: "This browser can't listen. Type your answer instead.",
};
