import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { fakeStation } from "@/features/sensor/fakeStation";
import { connectSensor, disconnectSensor } from "@/features/sensor/sensorStore";
import { SensorStep } from "./SensorStep";

const TARGET = { bpm: 72, spo2: 98 };

function setup() {
  const onNext = vi.fn();
  const onReading = vi.fn();
  render(
    <SensorStep
      target={TARGET}
      profileId="ana"
      onNext={onNext}
      onReading={onReading}
    />,
  );
  return { onNext, onReading };
}

/** La estación manda `times` mensajes, uno por segundo. */
const send = (
  station: ReturnType<typeof fakeStation>,
  text: string,
  times = 1,
) =>
  act(() => {
    for (let i = 0; i < times; i++) station.notify(text);
  });

/** Los segundos contados que muestra el paso. */
const seconds = () =>
  (screen.getByRole("progressbar") as HTMLProgressElement).value;

afterEach(() => {
  cleanup();
  disconnectSensor();
});

test("sin Web Bluetooth queda la lectura simulada, y lo dice", () => {
  setup();
  expect(
    screen.getByText(/Este navegador no puede conectarse al sensor/),
  ).toBeTruthy();
  expect(screen.getByRole("button", { name: "Empezar lectura" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Conectar sensor" })).toBeNull();
});

test("con la estación conectada espera el dedo y no cuenta hasta tener señal", async () => {
  const station = fakeStation();
  await act(() => connectSensor(station.bluetooth));
  setup();

  expect(screen.getByText(/Pon el dedo en el sensor/)).toBeTruthy();
  expect(screen.getByText(/Lectura en vivo del sensor/)).toBeTruthy();
  send(station, "0,0", 12);
  expect(seconds()).toBe(0);

  send(station, "71,98", 3);
  expect(seconds()).toBe(3);
  expect(screen.getByText("Mantén el dedo quieto")).toBeTruthy();
  expect(screen.getByText("71")).toBeTruthy();
  expect(screen.getByText("98")).toBeTruthy();
});

test("si el dedo se mueve, avisa y vuelve a empezar", async () => {
  const station = fakeStation();
  await act(() => connectSensor(station.bluetooth));
  setup();

  send(station, "71,98", 20);
  send(station, "0,0");
  expect(seconds()).toBe(0);
  expect(
    screen.getByText("Mantén el dedo quieto. Empezamos de nuevo."),
  ).toBeTruthy();
});

test("a los 60 s guarda la lectura del perfil y deja seguir o medir otra vez", async () => {
  const station = fakeStation();
  await act(() => connectSensor(station.bluetooth));
  const { onNext, onReading } = setup();

  send(station, "70,97", 60);
  expect(screen.getByText("Lectura completa")).toBeTruthy();
  expect(onReading).toHaveBeenCalledTimes(1);
  expect(onReading).toHaveBeenCalledWith("ana", {
    bpm: 70,
    spo2: 97,
    hrv: null,
    validSeconds: 60,
  });

  // Lo que la estación siga mandando ya no cambia la lectura.
  send(station, "90,95", 3);
  expect(screen.getByText("70")).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Medir otra vez" }));
  expect(seconds()).toBe(0);
  send(station, "74,98", 60);
  expect(onReading).toHaveBeenCalledTimes(2);

  fireEvent.click(screen.getByRole("button", { name: "Seguir" }));
  expect(onNext).toHaveBeenCalled();
});

test("si se pierde la conexión a media medición, lo dice y deja reconectar o simular", async () => {
  vi.useFakeTimers();
  const station = fakeStation();
  await act(() => connectSensor(station.bluetooth));
  setup();

  send(station, "71,98", 10);
  // La estación se apaga: los reintentos automáticos no la encuentran.
  await act(async () => {
    station.drop(99);
    await vi.advanceTimersByTimeAsync(5000);
  });
  vi.useRealTimers();

  expect(screen.getByText("Se perdió la conexión con el sensor.")).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Reconectar sensor" }),
  ).toBeTruthy();
  expect(screen.getByRole("button", { name: "Saltar el sensor" })).toBeTruthy();

  fireEvent.click(
    screen.getByRole("button", { name: "Usar una lectura simulada" }),
  );
  expect(screen.getByText("Sensor simulado para la demo")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Empezar lectura" })).toBeTruthy();
});
