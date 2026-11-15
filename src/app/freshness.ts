// ¿Esta pestaña se quedó con una versión vieja de la app?
//
// Tras un despliegue, el service worker nuevo toma el control de las pestañas
// abiertas y borra los archivos de la versión anterior. La pestaña sigue con
// el código viejo, que pide imágenes que ya no existen: el servidor contesta
// con la página de la app y la imagen se ve rota (pasó con Lunito en
// Emergencia). No se recarga de golpe, para no cortar un check-in o un caso a
// la mitad: el router carga la app nueva en el siguiente cambio de pantalla.

type Workers = Pick<ServiceWorkerContainer, "controller" | "addEventListener">;

/**
 * Vigila el cambio de service worker. Devuelve una función que dice si la
 * pestaña quedó atrás. La primera instalación (antes no había ninguno al
 * mando) no cuenta: ahí no hay versión anterior.
 */
export function watchForNewVersion(workers: Workers | undefined) {
  if (!workers) return () => false;
  let controlled = workers.controller !== null;
  let stale = false;
  workers.addEventListener("controllerchange", () => {
    if (controlled) stale = true;
    controlled = true;
  });
  return () => stale;
}
