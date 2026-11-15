// Emergencia a bordo (/emergencia): abrir el caso, atenderlo y cerrarlo.
export const emergency = {
  // Abrir el caso: a quién le pasa y qué pasó.
  form: {
    alert: "Opening the case alerts Ground right away.",
    who: "Who needs help?",
    what: "What happened?",
    open: "Open emergency · {name}",
    // El botón dice qué falta mientras no se puede abrir el caso.
    chooseBoth: "Choose the person and what happened",
    choosePerson: "Now choose the person",
    chooseWhat: "Now choose what happened",
  },
  // Opciones de "¿Qué pasó?". La clave es el código que se guarda en el caso,
  // así el caso se lee en cualquier idioma.
  what: {
    fainted: "Fainted",
    chestPain: "Chest pain",
    breathing: "Trouble breathing",
    hardHit: "Hard blow",
    other: "Other",
  },
  // Franja roja del caso.
  banner: {
    open: "Emergency · {time}",
    closed: "Case closed · opened at {time}",
    headline: "{name} · {what}",
  },
  // Aviso a Tierra y su retraso.
  link: {
    sent: "Case sent to Ground · {time}",
    delay: "{minutes}-min delay each way · reply expected at {time}",
    countdown: "Ground reply in",
    due: "Reply expected now · check the case log",
    replied: "Ground replied at {time}",
    closedAt: "Case closed at {time}",
  },
  protocol: {
    title: "Protocol",
    sample: "Sample protocol · {pending}",
    now: "now",
    groundOrders: "Ground instructions",
    orderNote: "Ground instruction · sent {time}",
    // Pasos de ejemplo, pendientes de validar (SISTEMA.md §7.5).
    steps: {
      restrain: "Secure the person and yourself",
      responsive: "Responsive? Breathing?",
      sensor: "Put the sensor on their finger",
      oxygen: "Check the oxygen in the med kit",
    },
  },
  // Dictar una nota: un toque empieza, otro guarda.
  dictate: {
    start: "Dictate a note",
    listening: "Listening… tap to save",
    saving: "Saving the note…",
    autoStop: "Saves on its own after {seconds} s",
    typeInstead: "You can also type the note.",
    noteLabel: "Note for the case log",
    placeholder: "Type the note",
  },
  // Registro del caso: cada texto se arma al mostrarlo, en el idioma activo.
  log: {
    title: "Case log",
    opened: "Case opened: {name} · {what}",
    // Entre el número y su unidad va un espacio duro (U+00A0): no se separan.
    vitals: "Sensor vitals: {bpm}\u00a0bpm, {spo2}%\u00a0SpO2",
    note: "“{text}”",
    groundOrder: "Ground instruction: {text}",
    orderDone: "Done: {text}",
    closed: "Case closed",
    // Notas de muestra para la demo cuando no hay micrófono ni dictado.
    samples: {
      eyesOpen: "Opened their eyes, slow to respond",
      dizzy: "Says they felt dizzy before going down",
      breathing: "Breathing normally, normal skin color",
    },
  },
  close: {
    button: "Close case",
    confirm: "Close {name}'s case?",
    yes: "Yes, close it",
    no: "No, keep it open",
    newCase: "New case",
    stayOpen: "Leaving this screen keeps the case open.",
  },
};
