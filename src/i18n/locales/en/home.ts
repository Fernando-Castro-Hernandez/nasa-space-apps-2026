// Inicio: Así estás hoy, Tus datos y Tu misión.
export const home = {
  // Carrusel de dos páginas en celular.
  carousel: {
    label: "Home",
    role: "carousel",
    page: "page",
    pageOf: "{n} of {total}",
    pages: "Home pages",
  },
  today: {
    title: "How you're doing today",
    /** Lunito como botón: abre la conversación. */
    lunito: "Lunito, {status}. Talk to Lunito",
    /** Burbuja de un indicador: lleva a Mi estado. */
    bubble: "{metric}: {value}, {status}. See my status",
    checkIn: "Do my check-in",
    talk: "Talk to Lunito",
    swipe: "Swipe to see your data",
  },
  // "Qué significa": el semáforo explicado.
  meaning: {
    open: "What it means",
    title: "What each status means",
    verde: "Your readings are within your usual range.",
    ambar:
      "A reading is drifting from your usual range. Rest and measure again.",
    rojo: "A reading is out of range. Tell the crew medical officer.",
  },
  data: {
    title: "Your data",
    lastWeek: "Last 7 days",
    lastMonth: "Last 4 weeks",
    period: "Period",
    week: "Week",
    month: "Month",
    metric: "Metric",
    lastReading: "Last reading · {time}",
    sensorReading: "Measured with the sensor · {time}",
    weekRange: "Weekly range",
    monthRange: "Monthly range",
    average: "Average",
    /** Nombre accesible de la gráfica: "Pulse, week: 71, 77… bpm". */
    chart: "{metric}, {period}: {values} {unit}",
    chartWeek: "week",
    chartMonth: "month",
    point: "{day}: {value}",
    baseline: "Baseline",
  },
  mission: {
    title: "Your mission",
    buddy: "Buddy of the day",
    withBuddy: "Today you're with {name}",
    noBuddyTitle: "Your buddy of the day",
    noBuddy: "No one is paired with you today",
    // Los mismos nombres que la tarjeta de Equipo (SISTEMA.md §8).
    autonomy: "Crew autonomy",
    wellHandled: "{count} of {total} cases handled well",
    target: "Goal",
    gauge: "Autonomy {value}, goal {target}",
    ridgeTitle: "Commander's panel · RIDGE",
    ridgeView: "Commander view · Read only",
    ridgeList: "RIDGE panel",
  },
  // Frase corta del estado (headline.ts): la usa el resultado del check-in.
  headline: {
    good: "{status}: your readings are within your usual range.",
    reason: "{status} · {indicator}: {reason}",
    heart: "pulse",
    oxygen: "oxygen",
    recovery: "heart rate variability",
  },
  // Motivo corto del Inicio anterior (dashboardData.ts).
  short: {
    heart: "Pulse",
    oxygen: "Oxygen",
    recovery: "HRV",
    line: "{indicator}: {reason}",
  },
};
