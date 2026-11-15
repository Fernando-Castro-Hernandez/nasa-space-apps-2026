// Bloques de voz: micrófono, transcripción y campos de la bitácora.
export const voiceUi = {
  mic: {
    // Nombre del micrófono mientras escucha: tocarlo termina.
    stop: "Finish talking",
  },
  // Hoja "Esto entendí": el texto y los campos de la bitácora, para revisar
  // lo que se dijo o para escribirlo.
  sheet: {
    heard: "Here's what I understood",
    text: "Your answer",
    placeholder: "Tell me how you slept and how you're feeling.",
    organize: "Organize my voice log",
    organizing: "Sorting out what you said…",
    understood: "What I understood · tap to fix it",
    failed: "I couldn't organize your voice log. Fill in the fields yourself.",
    required: "Choose your mood and stress to finish.",
    confirm: "Done",
  },
  // Lo que Lunito pregunta en voz alta cuando la persona no lo dijo.
  followUp: {
    sleep: "How many hours did you sleep?",
    mood: "And your mood, from 1 to 5?",
    stress: "And how stressed are you, from 1 to 5?",
    symptoms: "Is anything bothering you, like a headache or dizziness?",
  },
  fields: {
    sleep: "Sleep",
    sleepHours: "Hours of sleep",
    sleepQuality: "Sleep quality: {quality}",
    qualities: {
      mala: "Poor",
      regular: "Fair",
      buena: "Good",
    },
    symptoms: "Symptoms",
    mood: "Mood",
    stress: "Stress",
    // Escalas de 1 a 5: la palabra de cada punto. Los extremos se ven siempre.
    moodLevels: {
      veryLow: "very low",
      low: "low",
      okay: "okay",
      good: "good",
      veryGood: "very good",
    },
    stressLevels: {
      none: "none",
      little: "a little",
      some: "some",
      quiteABit: "quite a bit",
      aLot: "a lot",
    },
    scaleOption: "{name} {value} of 5: {word}",
    selected: "{name} · {word}",
    pending: "{name} · not chosen yet",
  },
};
