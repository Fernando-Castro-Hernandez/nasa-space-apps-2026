// Conexión con la estación por Web Bluetooth (HU-04, C18): funciona en Chrome
// de escritorio y de Android, en una página HTTPS o en localhost; no en iOS.
// Los tipos son lo mínimo que se usa, escritos a mano para no sumar una
// dependencia (igual que los bindings en worker/env.ts).
import {
  parseSample,
  SENSOR_CHARACTERISTIC,
  SENSOR_NAME,
  SENSOR_SERVICE,
  type SensorSample,
} from "./protocol";

type Characteristic = EventTarget & {
  value?: DataView;
  startNotifications(): Promise<unknown>;
};
type GattServer = {
  connected: boolean;
  connect(): Promise<GattServer>;
  disconnect(): void;
  getPrimaryService(uuid: string): Promise<{
    getCharacteristic(uuid: string): Promise<Characteristic>;
  }>;
};
export type BluetoothDevice = EventTarget & { gatt?: GattServer };
export type Bluetooth = {
  requestDevice(options: {
    filters: ({ services: string[] } | { name: string })[];
    optionalServices: string[];
  }): Promise<BluetoothDevice>;
};

/** Web Bluetooth del navegador, o null si no lo tiene. */
export const browserBluetooth = (): Bluetooth | null =>
  (globalThis.navigator as { bluetooth?: Bluetooth } | undefined)?.bluetooth ??
  null;

/** Abre el selector de dispositivos del navegador (exige un toque de la
 *  persona). La estación se reconoce por su servicio o por su nombre. */
export const chooseStation = (bluetooth: Bluetooth) =>
  bluetooth.requestDevice({
    filters: [{ services: [SENSOR_SERVICE] }, { name: SENSOR_NAME }],
    optionalServices: [SENSOR_SERVICE],
  });

/** La persona cerró el selector sin elegir: no es un error que avisar. */
export const isCancel = (error: unknown) =>
  error instanceof Error && error.name === "NotFoundError";

const decoder = new TextDecoder();

/** Se conecta a la estación y entrega cada mensaje ya leído. Se puede volver
 *  a llamar con el mismo dispositivo para reconectar, sin otro toque. */
export async function listen(
  device: BluetoothDevice,
  onSample: (sample: SensorSample) => void,
): Promise<void> {
  if (!device.gatt) throw new Error("La estación no ofrece GATT");
  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(SENSOR_SERVICE);
  const characteristic = await service.getCharacteristic(SENSOR_CHARACTERISTIC);
  // Al reconectar, la característica es un objeto nuevo: no se duplica.
  characteristic.addEventListener("characteristicvaluechanged", () => {
    if (!characteristic.value) return;
    const sample = parseSample(decoder.decode(characteristic.value));
    if (sample) onSample(sample);
  });
  await characteristic.startNotifications();
}
