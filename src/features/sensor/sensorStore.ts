// Estado de la conexión con la estación, compartido por toda la app: se
// conecta una vez (un toque) y el check-in y Emergencia leen del mismo sensor.
// Vive en memoria: el permiso de Bluetooth es de esta pestaña.
import { useSyncExternalStore } from "react";
import {
  type Bluetooth,
  type BluetoothDevice,
  browserBluetooth,
  chooseStation,
  isCancel,
  listen,
} from "./bluetooth";
import type { SensorSample } from "./protocol";

/**
 * - `unsupported`: este navegador no tiene Web Bluetooth.
 * - `off`: sin conectar.
 * - `connecting`: eligiendo la estación o conectando.
 * - `on`: llegan lecturas.
 * - `lost`: se perdió la conexión o no se pudo conectar; se puede reintentar.
 */
export type SensorLink = "unsupported" | "off" | "connecting" | "on" | "lost";

/** Reintentos automáticos al perder la conexión, y la espera entre ellos. */
const RETRIES = 3;
const RETRY_MS = 1000;

type SampleListener = (sample: SensorSample) => void;

/** El Bluetooth en uso: el del navegador, o el que se pasó al conectar. */
let api: Bluetooth | null = browserBluetooth();
let link: SensorLink = api ? "off" : "unsupported";
let device: BluetoothDevice | null = null;
/** Cambia en cada conexión o desconexión pedida: un reintento viejo no sigue. */
let session = 0;
const linkListeners = new Set<() => void>();
const sampleListeners = new Set<SampleListener>();

function setLink(next: SensorLink) {
  if (link === next) return;
  link = next;
  linkListeners.forEach((listener) => listener());
}

const emit: SampleListener = (sample) =>
  sampleListeners.forEach((listener) => listener(sample));

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** La estación vuelve a anunciarse al desconectarse: se reintenta sola. */
async function reconnect(current: BluetoothDevice, mine: number) {
  setLink("lost");
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    await wait(RETRY_MS);
    if (mine !== session) return;
    try {
      await listen(current, emit);
      if (mine === session) setLink("on");
      return;
    } catch {
      // Sigue fuera de alcance o apagada: se intenta otra vez.
    }
  }
}

/**
 * Conecta con la estación. La primera vez abre el selector del navegador, así
 * que debe llamarse desde un toque; después reconecta con la misma estación.
 */
export async function connectSensor(
  bluetooth: Bluetooth | null = browserBluetooth(),
): Promise<void> {
  if (!bluetooth) return setLink("unsupported");
  if (link === "connecting" || link === "on") return;
  api = bluetooth;
  const mine = ++session;
  const back = link;
  const known = device !== null;
  setLink("connecting");
  try {
    if (!device) {
      const chosen = await chooseStation(bluetooth);
      chosen.addEventListener("gattserverdisconnected", () => {
        if (device === chosen && link === "on") void reconnect(chosen, session);
      });
      device = chosen;
    }
    await listen(device, emit);
    if (mine === session) setLink("on");
  } catch (error) {
    if (mine !== session) return;
    // Si la estación ya elegida no responde, el siguiente intento vuelve a
    // abrir el selector (puede ser otra estación, o la misma ya reiniciada).
    if (known) device = null;
    // Cerrar el selector sin elegir deja todo como estaba.
    setLink(isCancel(error) && back !== "lost" ? "off" : "lost");
  }
}

/** Suelta la estación. La siguiente conexión vuelve a abrir el selector. */
export function disconnectSensor() {
  session++;
  const current = device;
  device = null;
  if (current?.gatt?.connected) current.gatt.disconnect();
  setLink(api ? "off" : "unsupported");
}

/** Recibe cada lectura de la estación mientras esté conectada. */
export function onSensorSample(listener: SampleListener) {
  sampleListeners.add(listener);
  return () => {
    sampleListeners.delete(listener);
  };
}

const subscribe = (listener: () => void) => {
  linkListeners.add(listener);
  return () => {
    linkListeners.delete(listener);
  };
};

export const sensorLink = () => link;
export const useSensorLink = () =>
  useSyncExternalStore(subscribe, sensorLink, sensorLink);
