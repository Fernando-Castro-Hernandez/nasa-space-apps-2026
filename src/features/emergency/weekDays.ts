// Días de la gráfica de la consola con su abreviatura de tres letras ("Mon",
// "lun"): las iniciales sueltas se repiten ("T", "S") y la gráfica junta los
// días con la misma etiqueta. Las series de muestra van de lunes a domingo.
import type { DayPoint } from "@/components/premium/chart-14/charts-14";
import { formatDate } from "@/i18n";

// 1 de enero de 2024 fue lunes.
const MONDAY = Date.UTC(2024, 0, 1);
const DAY = 86_400_000;

/** Día `index` de la semana (0 = lunes), abreviado en el idioma activo. */
export const weekdayShort = (index: number) =>
  formatDate(MONDAY + (index % 7) * DAY, { weekday: "short", timeZone: "UTC" });

/** La serie de lunes a domingo, con cada día abreviado y distinto. */
export const withWeekdays = (days: DayPoint[]): DayPoint[] =>
  days.map((d, i) => ({ day: weekdayShort(i), value: d.value }));
