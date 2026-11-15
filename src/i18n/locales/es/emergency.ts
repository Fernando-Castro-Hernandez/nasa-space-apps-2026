// Emergencia a bordo (/emergencia): abrir el caso, atenderlo y cerrarlo.
import type { Messages } from "../../translate";
import type { emergency as source } from "../en/emergency";

export const emergency: Messages<typeof source> = {
  // Abrir el caso: a quién le pasa y qué pasó.
  form: {
    alert: "Al abrir el caso se avisa a Tierra de inmediato.",
    who: "¿A quién le pasa?",
    what: "¿Qué pasó?",
    open: "Abrir emergencia · {name}",
    // El botón dice qué falta mientras no se puede abrir el caso.
    chooseBoth: "Elige a la persona y qué pasó",
    choosePerson: "Ahora elige a la persona",
    chooseWhat: "Ahora elige qué pasó",
  },
  // Opciones de "¿Qué pasó?". La clave es el código que se guarda en el caso,
  // así el caso se lee en cualquier idioma.
  what: {
    fainted: "Se desmayó",
    chestPain: "Dolor en el pecho",
    breathing: "Dificultad para respirar",
    hardHit: "Golpe fuerte",
    other: "Otro",
  },
  // Franja roja del caso.
  banner: {
    open: "Emergencia · {time}",
    closed: "Caso cerrado · abierto a las {time}",
    headline: "{name} · {what}",
  },
  // Aviso a Tierra y su retraso.
  link: {
    sent: "Caso enviado a Tierra · {time}",
    delay: "Retraso de {minutes} min por tramo · respuesta estimada {time}",
    countdown: "Respuesta de Tierra en",
    due: "Respuesta esperada · revisa el registro",
    replied: "Tierra respondió a las {time}",
    closedAt: "Caso cerrado a las {time}",
  },
  protocol: {
    title: "Protocolo",
    sample: "Protocolo de ejemplo · {pending}",
    now: "ahora",
    groundOrders: "Indicaciones de Tierra",
    orderNote: "Indicación de Tierra · enviada {time}",
    // Pasos de ejemplo, pendientes de validar (SISTEMA.md §7.5).
    steps: {
      restrain: "Sujetar a la persona y sujetarte tú",
      responsive: "¿Responde? ¿Respira?",
      sensor: "Pon el sensor en su dedo",
      oxygen: "Revisar oxígeno del botiquín",
    },
  },
  // Dictar una nota: un toque empieza, otro guarda.
  dictate: {
    start: "Dictar nota",
    listening: "Escuchando… toca para guardar",
    saving: "Guardando la nota…",
    autoStop: "Se guarda sola a los {seconds} s",
    typeInstead: "También puedes escribir la nota.",
    noteLabel: "Nota para el registro del caso",
    placeholder: "Escribe la nota",
  },
  // Registro del caso: cada texto se arma al mostrarlo, en el idioma activo.
  log: {
    title: "Registro del caso",
    opened: "Caso abierto: {name} · {what}",
    vitals: "Signos con sensor: {bpm}\u00a0lpm, {spo2}\u00a0%\u00a0SpO2",
    note: "“{text}”",
    groundOrder: "Indicación de Tierra: {text}",
    orderDone: "Hecho: {text}",
    closed: "Caso cerrado",
    // Notas de muestra para la demo cuando no hay micrófono ni dictado.
    samples: {
      eyesOpen: "Abrió los ojos, responde lento",
      dizzy: "Dice que se mareó antes de caer",
      breathing: "Respira normal, color de piel normal",
    },
  },
  close: {
    button: "Cerrar caso",
    confirm: "¿Cerrar el caso de {name}?",
    yes: "Sí, cerrar",
    no: "No, sigue abierto",
    newCase: "Nuevo caso",
    stayOpen: "Salir de esta pantalla no cierra el caso.",
  },
};
