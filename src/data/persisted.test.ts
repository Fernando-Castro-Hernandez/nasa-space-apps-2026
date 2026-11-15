import { beforeEach, describe, expect, it } from "vitest";
import { persistedStore } from "./persisted";

const make = () =>
  persistedStore<number>(
    "test.counter",
    (raw) => (raw === null ? 0 : Number(raw)),
    String,
  );

describe("persistedStore", () => {
  beforeEach(() => window.localStorage.clear());

  it("devuelve el valor por defecto de parse(null) si no hay nada", () => {
    expect(make().get()).toBe(0);
  });

  it("guarda, lee y borra", () => {
    const s = make();
    s.set(7);
    expect(window.localStorage.getItem("test.counter")).toBe("7");
    expect(s.get()).toBe(7);
    s.clear();
    expect(s.get()).toBe(0);
  });

  it("el snapshot es estable mientras el texto no cambie", () => {
    const s = persistedStore<{ a: number }>(
      "test.obj",
      (raw) => (raw ? (JSON.parse(raw) as { a: number }) : { a: 0 }),
      JSON.stringify,
    );
    s.set({ a: 1 });
    expect(s.get()).toBe(s.get());
  });
});
