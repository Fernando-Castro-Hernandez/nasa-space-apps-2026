// Lo que dice Lunito por reglas y los textos de su conversación.
export const lunito = {
  // Frases fijas de las reglas (src/api/lunitoRules.ts). También se dicen en
  // voz alta: cortas y sin abreviaturas.
  rules: {
    hello: "Hi, {name}.",
    stateGood:
      "Your status today is Good: your readings are within your usual range.",
    state: "Your status today is {status}.",
    stateWithReason: "Your status today is {status}. {reason}.",
    repeatMeasurement: "Take your measurement again.",
    tellCmo: "Let {cmo}, your crew medical officer, know.",
    askCheckIn: "Shall we do your check-in?",
    suggestAction: "Here's what I suggest: {action}.",
    allDone: "You've done everything for today.",
    noDetail: "I can't give you a detailed answer right now.",
    emergency:
      "This could be an emergency. Tap the red Emergency button now and alert {cmo}, your crew medical officer. I'm right here with you.",
    emergencySelf:
      "This could be an emergency. Tap the red Emergency button now. I'm right here with you.",
  },
  chat: {
    region: "Talk to Lunito",
    you: "You: “{message}”",
    thinking: "Let me think…",
    openEmergency: "Open Emergency",
    doCheckIn: "Do my check-in",
    mic: "Speak to Lunito",
    input: "Write to Lunito",
    listening: "I'm listening… tap the mic to send",
    send: "Send message to Lunito",
    speaking: "Lunito is speaking",
    listen: "Listen to Lunito",
    voiceOff: "Voice off",
    turnVoiceOff: "Turn voice off",
    disclaimer: "Lunito keeps you company and guides you. It doesn't diagnose.",
    cmoFallback: "the crew medical officer",
  },
};
