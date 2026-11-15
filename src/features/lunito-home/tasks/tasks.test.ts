import { expect, test } from "vitest";
import type { VoiceLog } from "@/features/voice/voiceLogStore";
import { checkInTime, taskProgress } from "./tasks";

test("cuenta las tareas completadas y calcula el porcentaje", () => {
  expect(taskProgress([true, false, false])).toEqual({
    count: 1,
    total: 3,
    percent: 33,
    done: false,
    label: "1 de 3 completadas",
  });
});

test("sin tareas el progreso es cero y no divide entre cero", () => {
  expect(taskProgress([]).percent).toBe(0);
  expect(taskProgress([]).done).toBe(false);
  expect(taskProgress([true, true]).percent).toBe(100);
  expect(taskProgress([true, true]).done).toBe(true);
});

// Sin `savedAt`: así eran las bitácoras guardadas antes de tener la hora.
const log: VoiceLog = {
  day: "2026-11-15",
  transcript: "Dormí bien",
  fields: {
    sleepHours: 7,
    sleepQuality: null,
    mood: null,
    stress: null,
    symptoms: [],
  },
};

test("la hora del check-in sale de la bitácora si la trae", () => {
  expect(checkInTime(null)).toBeNull();
  expect(checkInTime(log)).toBeNull();
  expect(checkInTime({ ...log, savedAt: 1_763_200_000_000 })).toBe(
    1_763_200_000_000,
  );
});
