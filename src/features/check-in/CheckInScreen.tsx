// /check-in ya no es una pantalla: hay un solo check-in, el inicio del día
// (/buenos-dias), que usa el sensor, la prueba de reacción y el resultado de
// esta carpeta. Mientras la ruta exista, lleva ahí sin dejar /check-in en el
// historial (volver atrás no regresa a un redireccionamiento).
import { useEffect } from "react";

export function CheckInScreen() {
  useEffect(() => {
    window.history.replaceState(null, "", "/buenos-dias");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);
  return null;
}
