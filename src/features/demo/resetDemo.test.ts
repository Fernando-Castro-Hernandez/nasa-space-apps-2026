import { afterEach, expect, test } from "vitest";
import { dayKey, dayStartDue, snoozeDayStart } from "@/app/dayStart";
import { resetDemo } from "./resetDemo";

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

// Todo lo que la demo guarda en el dispositivo.
const DEMO_KEYS = [
  "nostos.day-start",
  "nostos.voice-log",
  "nostos.daily-actions",
  "nostos.encouragement",
  "nostos.profile",
  "nostos.share",
  "nostos.case",
  "nostos.demo",
  "nostos.reading",
];

test("el reinicio borra todo lo que la demo guardó y conserva las preferencias", () => {
  localStorage.setItem("nostos.day-start", dayKey());
  localStorage.setItem("nostos.voice-log", "{}");
  localStorage.setItem("nostos.daily-actions", "ana:2026-11-15:walk");
  localStorage.setItem("nostos.encouragement", "[]");
  localStorage.setItem("nostos.profile", "mei");
  localStorage.setItem("nostos.share", "{}");
  localStorage.setItem("nostos.case", "{}");
  localStorage.setItem("nostos.demo", "alto");
  localStorage.setItem("nostos.reading", "2");
  localStorage.setItem("nostos.locale", "en");
  localStorage.setItem("nostos.lunito-silencio", "true");
  snoozeDayStart();

  resetDemo();

  for (const key of DEMO_KEYS) expect(localStorage.getItem(key)).toBeNull();
  expect(dayStartDue()).toBe(true);
  expect(localStorage.getItem("nostos.locale")).toBe("en");
  expect(localStorage.getItem("nostos.lunito-silencio")).toBe("true");
});
