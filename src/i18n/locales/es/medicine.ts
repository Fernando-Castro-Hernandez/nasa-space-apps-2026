// Botiquín: síntomas, asistente e inventario.
// Contenido de salud con fuente (docs/FUENTES.md §3): estos textos son los
// originales; el inglés los sigue al pie de la letra.
import type { Messages } from "../../translate";
import type { medicine as source } from "../en/medicine";

export const medicine: Messages<typeof source> = {
  tabs: {
    label: "Secciones del botiquín",
    symptoms: "Síntomas",
    inventory: "Inventario",
  },
  yes: "Sí",
  no: "No",
  sourceLabel: "Fuente:",
  // Buscador de síntomas.
  search: {
    title: "¿Qué sientes?",
    label: "Buscar síntoma",
    placeholder: "¿Qué sientes?",
    guided: "Guía paso a paso",
    noProtocol: "Sin protocolo",
    empty: "No encontramos ese síntoma. Avisa al oficial médico.",
    clear: "Borrar la búsqueda",
  },
  // Síntomas frecuentes en vuelo (SISTEMA.md §6).
  symptoms: {
    headache: "Dolor de cabeza",
    nausea: "Náusea y mareo",
    congestion: "Congestión nasal",
    back: "Dolor de espalda",
    eyes: "Cambios en la visión",
  },
  // Síntomas sin protocolo con fuente: se dice y se ofrece la salida.
  pending: {
    noSource: "Este protocolo aún no tiene fuente cargada.",
    meanwhile: "Mientras tanto, avisa al oficial médico.",
    back: "Volver a síntomas",
    urgent: "¿Es urgente? Ir a Emergencia",
  },
  // Asistente de dolor de cabeza (FUENTES.md §3).
  headache: {
    steps: {
      screening: "Descarte",
      history: "Historial",
      medicines: "Medicamentos",
    },
    stepOf: "Paso {step} de {total} · {name}",
    answered: "{count} de {total} respondidas",
    back: "Atrás",
    next: "Siguiente",
    seeWhatToDo: "Ver qué hacer",
    backToSymptoms: "Volver a síntomas",
    screeningIntro: "Si respondes sí a cualquiera, llama al cirujano de vuelo.",
    // Banderas rojas de SNNOOP10, en el orden de RED_FLAGS (headache.ts).
    redFlags: {
      sudden: "¿Empezó de golpe o es el peor dolor de tu vida?",
      neuro:
        "¿Tienes debilidad, problemas para hablar, confusión o visión alterada?",
      neck: "¿Tienes fiebre con rigidez de cuello?",
      trauma: "¿Te golpeaste la cabeza hace poco?",
      strain: "¿Empeora al toser, hacer esfuerzo o cambiar de postura?",
      vision: "¿Notaste un cambio nuevo en la visión?",
    },
    analgesicDays: "¿Cuántos días tomaste analgésicos este mes?",
    fever: "¿Tienes fiebre?",
    worsening: "¿El dolor empeora o lleva más de 10 días?",
    paracetamolTablets:
      "¿Cuántas tabletas de paracetamol tomaste en las últimas 24 h?",
    days: "días",
    tablets: "tabletas",
    chronic:
      "¿Tienes enfermedad del hígado o del riñón, presión alta, enfermedad del corazón o asma?",
    ulcer: "¿Has tenido úlcera, sangrado del estómago o sangre en las heces?",
    ate: "¿Comiste?",
    labelsSource: "Etiquetas de paracetamol e ibuprofeno, DailyMed",
    // Motivos del resultado (assessHeadache).
    reasons: {
      redFlag: "Respondiste sí a una pregunta de descarte.",
      overuse: "Tomaste analgésicos 15 días o más este mes.",
      fever: "Tienes fiebre.",
      worsening: "El dolor empeora o dura más de 10 días.",
      chronic:
        "Tienes una condición que impide el ibuprofeno; el oficial médico debe saberlo.",
    },
  },
  // Resultado del asistente.
  result: {
    selfCare: "Puedes cuidarte tú",
    cmo: "Avisa al oficial médico",
    surgeon: "Contacta al cirujano de vuelo",
    noLinkSource:
      "SNNOOP10, Do et al., Neurology 2019. Sin comunicación, el oficial médico actúa sin el cirujano (NTRS 20100016333).",
    co2: "El CO2 de la cabina está alto: revisa primero la ventilación.",
    adaptation:
      "Primera semana de vuelo con náusea o congestión: es probable que sea adaptación al espacio.",
    whatToDo: "Qué puedes hacer",
    rest: "Descansa, duerme e hidrátate.",
    paracetamol: "Paracetamol",
    paracetamolOtc:
      "Referencia de venta libre: 500 mg, 2 tabletas cada 6 h, máximo 6 en 24 h.",
    paracetamolLeft: {
      one: "Te queda {count} tableta hoy.",
      other: "Te quedan {count} tabletas hoy.",
    },
    paracetamolIss:
      "Botiquín de la ISS: 325 mg, no más de 12 tabletas en 24 h.",
    ibuprofen: "Ibuprofeno",
    ibuprofenNo: "No tomes ibuprofeno; usa paracetamol.",
    ibuprofenFood: "Come algo antes: se toma con comida.",
    ibuprofenOtc:
      "Referencia de venta libre: 200 mg, 1 o 2 tabletas cada 4 a 6 h, máximo 6 en 24 h.",
    ibuprofenIss:
      "Botiquín de la ISS: 400 mg, con comida, no más de 8 en 24 h.",
    preferParacetamol:
      "Con dolor de costado, cálculos renales o deshidratación, preferir paracetamol.",
    ventilate: "Ir a una zona mejor ventilada.",
    kitSource:
      "DailyMed; NASA, Medical Kit 3.001 (2015), que el equipo toma como vigente.",
  },
  // Inventario simulado (inventory.ts).
  inventory: {
    title: "Inventario del botiquín",
    description: "Lo que queda a bordo, con faltantes y caducidad.",
    of: "de {capacity} {unit}",
    expires: "Caduca: {date}",
    alerts: {
      agotado: "Agotado",
      bajo: "Stock bajo",
      caducado: "Caducado",
      "por caducar": "Por caducar",
    },
    items: {
      paracetamol: "Paracetamol 325 mg",
      ibuprofen: "Ibuprofeno 400 mg",
      ors: "Sales de rehidratación oral",
      bandages: "Vendas elásticas",
      oxygen: "Oxígeno portátil",
    },
    units: {
      tablets: "tabletas",
      sachets: "sobres",
      rolls: "rollos",
      cylinders: "cilindros",
    },
  },
};
