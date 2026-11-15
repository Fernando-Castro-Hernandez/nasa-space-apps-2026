// Galería interna de poses de Lunito (herramienta de revisión).
import type { Messages } from "../../translate";
import type { lunitoLab as source } from "../en/lunitoLab";

export const lunitoLab: Messages<typeof source> = {
  title: "Laboratorio de Lunito",
  intro:
    "Herramienta interna para revisar cómo se mueve Lunito. No está en la navegación de la app.",
  avatarLabel: "Lunito, {pose}",
  pose: "Pose",
  gesture: "Hacer un gesto",
  status: "Estado de la pancita",
  size: "Tamaño",
  sizes: {
    phone: "Celular",
    large: "Grande",
  },
  data: "Latir y respirar con una lectura de muestra",
  speak: "Hacer hablar a Lunito",
  sampleLine:
    "Hola, soy Lunito. Cuéntame cómo dormiste y cómo te sientes esta mañana.",
  poses: {
    idle: "Reposo",
    greeting: "Saludo",
    asking: "Pregunta",
    listening: "Escucha",
    thinking: "Piensa",
    speaking: "Habla",
    celebrating: "Celebra",
    caring: "Cuida",
  },
  gestures: {
    wave: "Saludar con la mano",
    nod: "Asentir",
    cheer: "Festejar",
    giggle: "Risita",
  },
  compare: {
    title: "Lado a lado con las imágenes",
    hint: "Cada imagen junto a la pose que la reemplaza. Superponlas para revisar el encuadre.",
    overlay: "Superponer la imagen",
    image: "Imagen",
    model: "3D",
  },
  rig: {
    title: "Canales del rig",
    hint: "Mueve cada canal a mano para ver hasta dónde llega el modelo. Radianes para giros, unidades del modelo para distancias y de 0 a 1 para formas.",
    reset: "Reiniciar",
  },
};
