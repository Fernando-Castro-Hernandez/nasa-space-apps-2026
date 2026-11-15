// Botiquín: síntomas, asistente e inventario.
// Contenido de salud con fuente (docs/FUENTES.md §3): el inglés dice lo mismo
// que el español, con los mismos números, dosis y condiciones. Los nombres de
// los medicamentos son los genéricos (paracetamol, ibuprofen) y las citas no
// se traducen.
export const medicine = {
  tabs: {
    label: "Med kit sections",
    symptoms: "Symptoms",
    inventory: "Inventory",
  },
  yes: "Yes",
  no: "No",
  sourceLabel: "Source:",
  // Buscador de síntomas.
  search: {
    title: "What are you feeling?",
    label: "Search symptoms",
    placeholder: "What are you feeling?",
    guided: "Step-by-step guide",
    noProtocol: "No protocol yet",
    empty: "We couldn't find that symptom. Tell the crew medical officer.",
    clear: "Clear search",
  },
  // Síntomas frecuentes en vuelo (SISTEMA.md §6).
  symptoms: {
    headache: "Headache",
    nausea: "Nausea and dizziness",
    congestion: "Nasal congestion",
    back: "Back pain",
    eyes: "Vision changes",
  },
  // Síntomas sin protocolo con fuente: se dice y se ofrece la salida.
  pending: {
    noSource: "This protocol doesn't have a source loaded yet.",
    meanwhile: "In the meantime, tell the crew medical officer.",
    back: "Back to symptoms",
    urgent: "Urgent? Go to Emergency",
  },
  // Asistente de dolor de cabeza (FUENTES.md §3).
  headache: {
    steps: {
      screening: "Screening",
      history: "History",
      medicines: "Medicines",
    },
    stepOf: "Step {step} of {total} · {name}",
    answered: "{count} of {total} answered",
    back: "Back",
    next: "Next",
    seeWhatToDo: "See what to do",
    backToSymptoms: "Back to symptoms",
    screeningIntro:
      "If you answer yes to any of these, call the flight surgeon.",
    // Banderas rojas de SNNOOP10, en el orden de RED_FLAGS (headache.ts).
    redFlags: {
      sudden: "Did it start suddenly, or is it the worst pain of your life?",
      neuro:
        "Do you have weakness, trouble speaking, confusion, or altered vision?",
      neck: "Do you have a fever with a stiff neck?",
      trauma: "Did you hit your head recently?",
      strain: "Does it get worse when you cough, strain, or change position?",
      vision: "Have you noticed a new change in your vision?",
    },
    analgesicDays: "How many days did you take pain relievers this month?",
    fever: "Do you have a fever?",
    worsening: "Is the pain getting worse, or has it lasted more than 10 days?",
    paracetamolTablets:
      "How many paracetamol tablets did you take in the last 24 h?",
    days: "days",
    tablets: "tablets",
    chronic:
      "Do you have liver or kidney disease, high blood pressure, heart disease, or asthma?",
    ulcer: "Have you had an ulcer, stomach bleeding, or blood in your stool?",
    ate: "Have you eaten?",
    labelsSource: "Paracetamol and ibuprofen labels, DailyMed",
    // Motivos del resultado (assessHeadache).
    reasons: {
      redFlag: "You answered yes to a screening question.",
      overuse: "You took pain relievers on 15 or more days this month.",
      fever: "You have a fever.",
      worsening: "The pain is getting worse or has lasted more than 10 days.",
      chronic:
        "You have a condition that rules out ibuprofen; the crew medical officer needs to know.",
    },
  },
  // Resultado del asistente.
  result: {
    selfCare: "You can take care of this yourself",
    cmo: "Tell the crew medical officer",
    surgeon: "Contact the flight surgeon",
    noLinkSource:
      "SNNOOP10, Do et al., Neurology 2019. Without communication, the crew medical officer acts without the flight surgeon (NTRS 20100016333).",
    co2: "Cabin CO₂ is high: check the ventilation first.",
    adaptation:
      "First week of flight with nausea or congestion: it is likely space adaptation.",
    whatToDo: "What you can do",
    rest: "Rest, sleep, and stay hydrated.",
    paracetamol: "Paracetamol",
    paracetamolOtc:
      "Over-the-counter reference: 500 mg, 2 tablets every 6 h, maximum 6 in 24 h.",
    paracetamolLeft: {
      one: "You have {count} tablet left today.",
      other: "You have {count} tablets left today.",
    },
    paracetamolIss: "ISS medical kit: 325 mg, no more than 12 tablets in 24 h.",
    ibuprofen: "Ibuprofen",
    ibuprofenNo: "Don't take ibuprofen; use paracetamol.",
    ibuprofenFood: "Eat something first: take it with food.",
    ibuprofenOtc:
      "Over-the-counter reference: 200 mg, 1 or 2 tablets every 4 to 6 h, maximum 6 in 24 h.",
    ibuprofenIss: "ISS medical kit: 400 mg, with food, no more than 8 in 24 h.",
    preferParacetamol:
      "With flank pain, kidney stones, or dehydration, prefer paracetamol.",
    ventilate: "Move to a better-ventilated area.",
    kitSource:
      "DailyMed; NASA, Medical Kit 3.001 (2015), which the team treats as current.",
  },
  // Inventario simulado (inventory.ts).
  inventory: {
    title: "Med kit inventory",
    description: "What's left on board, with shortages and expiry dates.",
    of: "of {capacity} {unit}",
    expires: "Expires: {date}",
    alerts: {
      agotado: "Out of stock",
      bajo: "Low stock",
      caducado: "Expired",
      "por caducar": "Expires soon",
    },
    items: {
      paracetamol: "Paracetamol 325 mg",
      ibuprofen: "Ibuprofen 400 mg",
      ors: "Oral rehydration salts",
      bandages: "Elastic bandages",
      oxygen: "Portable oxygen",
    },
    units: {
      tablets: "tablets",
      sachets: "sachets",
      rolls: "rolls",
      cylinders: "cylinders",
    },
  },
};
