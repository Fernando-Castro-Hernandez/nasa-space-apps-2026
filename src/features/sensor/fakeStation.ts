// Solo para pruebas: una estación con la misma forma que Web Bluetooth, que
// manda los mensajes que la prueba le pide.
import { vi } from "vitest";
import type { Bluetooth, BluetoothDevice } from "./bluetooth";

/** Una estación de mentira con la misma forma que Web Bluetooth. */
export function fakeStation({ failures = 0 } = {}) {
  let left = failures;
  let characteristic = new EventTarget() as EventTarget & { value?: DataView };
  const gatt = {
    connected: false,
    connect: vi.fn(async () => {
      if (left-- > 0) throw new Error("fuera de alcance");
      gatt.connected = true;
      return gatt;
    }),
    disconnect: vi.fn(() => {
      gatt.connected = false;
    }),
    getPrimaryService: async () => ({
      getCharacteristic: async () => {
        characteristic = Object.assign(new EventTarget(), {
          startNotifications: async () => undefined,
        });
        return characteristic as never;
      },
    }),
  };
  const device = Object.assign(new EventTarget(), { gatt }) as BluetoothDevice;
  const requestDevice = vi.fn(async () => device);
  return {
    bluetooth: { requestDevice } as Bluetooth,
    requestDevice,
    gatt,
    /** La estación manda un mensaje. */
    notify(text: string) {
      characteristic.value = new DataView(
        new TextEncoder().encode(text).buffer,
      );
      characteristic.dispatchEvent(new Event("characteristicvaluechanged"));
    },
    /** La estación se sale de alcance. */
    drop(nextFailures = 0) {
      left = nextFailures;
      gatt.connected = false;
      device.dispatchEvent(new Event("gattserverdisconnected"));
    },
  };
}
