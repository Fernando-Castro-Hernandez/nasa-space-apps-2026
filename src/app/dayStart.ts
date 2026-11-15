const KEY = "nostos.day-start";

export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function needsDayStart() {
  try {
    return localStorage.getItem(KEY) !== dayKey();
  } catch {
    return true;
  }
}

export function finishDayStart() {
  try {
    localStorage.setItem(KEY, dayKey());
  } catch (error) {
    console.warn(
      "No se pudo recordar el inicio del día en este dispositivo.",
      error,
    );
  }
}
