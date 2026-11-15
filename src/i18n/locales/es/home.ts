// Inicio: Así estás hoy, Tus datos y Tu misión.
import type { Messages } from "../../translate";
import type { home as source } from "../en/home";

export const home: Messages<typeof source> = {
  // Carrusel de dos páginas en celular.
  carousel: {
    label: "Inicio",
    role: "carrusel",
    page: "página",
    pageOf: "{n} de {total}",
    pages: "Páginas de Inicio",
  },
  today: {
    title: "Así estás hoy",
    /** Lunito como botón: abre la conversación. */
    lunito: "Lunito, {status}. Hablar con Lunito",
    /** Burbuja de un indicador: lleva a Mi estado. */
    bubble: "{metric}: {value}, {status}. Ver mi estado",
    checkIn: "Hacer mi check-in",
    talk: "Hablar con Lunito",
    swipe: "Desliza para ver tus datos",
  },
  // "Qué significa": el semáforo explicado.
  meaning: {
    open: "Qué significa",
    title: "Qué significa cada estado",
    verde: "Tus indicadores están dentro de tu normal.",
    ambar:
      "Algún indicador se aleja de tu normal. Descansa y vuelve a medirte.",
    rojo: "Un indicador está fuera de rango. Avisa al oficial médico.",
  },
  data: {
    title: "Tus datos",
    lastWeek: "Últimos 7 días",
    lastMonth: "Últimas 4 semanas",
    period: "Periodo",
    week: "Semana",
    month: "Mes",
    metric: "Métrica",
    lastReading: "Último registro · {time}",
    sensorReading: "Medido con el sensor · {time}",
    weekRange: "Rango semanal",
    monthRange: "Rango mensual",
    average: "Promedio",
    /** Nombre accesible de la gráfica: "Pulso, semana: 71, 77… lpm". */
    chart: "{metric}, {period}: {values} {unit}",
    chartWeek: "semana",
    chartMonth: "mes",
    point: "{day}: {value}",
    baseline: "Línea base",
  },
  mission: {
    title: "Tu misión",
    buddy: "Compañero del día",
    withBuddy: "Hoy acompañas a {name}",
    noBuddyTitle: "Tu compañero del día",
    noBuddy: "No hay una pareja disponible",
    // Los mismos nombres que la tarjeta de Equipo (SISTEMA.md §8).
    autonomy: "Autonomía de la tripulación",
    wellHandled: "{count} de {total} casos bien atendidos",
    target: "Meta",
    gauge: "Autonomía {value}, meta {target}",
    ridgeTitle: "Panel del comandante · RIDGE",
    ridgeView: "Vista comandante · Solo lectura",
    ridgeList: "Panel RIDGE",
  },
  // Frase corta del estado (headline.ts): la usa el resultado del check-in.
  headline: {
    good: "{status}: tus indicadores están en tu normal.",
    reason: "{status} · {indicator}: {reason}",
    heart: "pulso",
    oxygen: "oxígeno",
    recovery: "variabilidad cardíaca",
  },
  // Motivo corto del Inicio anterior (dashboardData.ts).
  short: {
    heart: "Pulso",
    oxygen: "Oxígeno",
    recovery: "Variabilidad",
    line: "{indicator}: {reason}",
  },
};
