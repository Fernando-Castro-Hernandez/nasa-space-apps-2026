import { afterEach, describe, expect, test } from "vitest";
import { setLocale } from "@/i18n";
import {
  arrivesAt,
  countdown,
  formatTime,
  linkLabel,
  responseEta,
} from "./link";

afterEach(() => window.localStorage.clear());

const T0 = new Date(2026, 10, 14, 14, 3).getTime();

describe("enlace con Tierra", () => {
  test("formatea la hora como HH:MM", () => {
    expect(formatTime(T0)).toBe("14:03");
  });

  test("un tramo tarda el retraso; la respuesta, el doble", () => {
    expect(formatTime(arrivesAt(T0, 14))).toBe("14:17");
    expect(formatTime(responseEta(T0, 14))).toBe("14:31");
  });

  test("la cuenta regresiva no baja de cero", () => {
    expect(countdown(T0 + 90_000, T0)).toBe("01:30");
    expect(countdown(T0, T0 + 5000)).toBe("00:00");
  });

  test("dice si el mensaje va en camino o ya llegó", () => {
    expect(linkLabel(T0, 14, T0 + 60_000)).toBe("en camino · llega 14:17");
    expect(linkLabel(T0, 14, T0 + 15 * 60_000)).toBe("llegó 14:17");
  });

  test("en inglés, la hora sigue en 24 h y el enlace se dice en inglés", () => {
    setLocale("en");
    expect(formatTime(new Date(2026, 10, 14, 9, 5).getTime())).toBe("09:05");
    expect(linkLabel(T0, 14, T0 + 60_000)).toBe("in transit · arrives 14:17");
    expect(linkLabel(T0, 14, T0 + 15 * 60_000)).toBe("arrived 14:17");
  });
});
