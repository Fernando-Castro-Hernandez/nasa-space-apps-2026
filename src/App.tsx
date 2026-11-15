import { useEffect, useState } from "react";
import { useActiveCase } from "@/app/activeCase";
import { finishDayStart, snoozeDayStart, useDayStartDue } from "@/app/dayStart";
import { pagePlace, redirectFor, showDocumentTitle } from "@/app/pages";
import { findRoute } from "@/app/routes";
import {
  interceptLinks,
  navigate,
  previousPath,
  redirect,
  usePathname,
} from "@/app/router";
import { DayCheckInScreen } from "@/features/day-checkin/DayCheckInScreen";
import { MareaPage } from "@/features/lunito-home/ReferenceChrome";
import { t } from "@/i18n";

export function App() {
  const pathname = usePathname();
  const redirectTo = redirectFor(pathname);
  const path = redirectTo ?? pathname;
  const route = findRoute(path);
  const dayDue = useDayStartDue();
  const activeCase = useActiveCase();
  // El día empieza con el check-in de la mañana antes de Inicio, salvo que
  // haya una emergencia en curso: entonces Inicio no se interpone. Una vez
  // abierto, sigue hasta terminarlo o posponerlo, aunque a medio camino deje
  // de estar pendiente (al guardar la bitácora); salir de Inicio lo suelta.
  const atHome = route.path === "/";
  const [dayOpen, setDayOpen] = useState(false);
  if (atHome && dayDue && !activeCase && !dayOpen) setDayOpen(true);
  if (!atHome && dayOpen) setDayOpen(false);
  const dayStart =
    path === "/buenos-dias" || (atHome && (dayDue || dayOpen) && !activeCase);
  const title = dayStart ? t("shell.titles.dayStart") : route.title;

  const completeDay = () => {
    setDayOpen(false);
    finishDayStart();
    navigate("/");
  };

  // "Ahora no": Inicio deja de pedir el check-in durante esta sesión.
  const skipDay = () => {
    setDayOpen(false);
    snoozeDayStart();
    navigate("/");
  };

  useEffect(interceptLinks, []);
  useEffect(() => {
    if (redirectTo) redirect(redirectTo);
  }, [redirectTo]);
  useEffect(() => showDocumentTitle(title), [title]);

  // El check-in trae su propio acceso a Emergencia y la franja del caso.
  if (dayStart)
    return <DayCheckInScreen onDone={completeDay} onSkip={skipDay} />;

  const { Screen } = route;
  // Las cuatro pestañas y la consola de Tierra traen su propia estructura.
  if (!route.shell) return <Screen />;

  // Las pantallas secundarias comparten la estructura Marea. La `key` hace
  // que cada pantalla entre con su propia transición.
  return (
    <MareaPage
      key={route.path}
      title={route.title}
      {...pagePlace(route.path, previousPath())}
    >
      <Screen />
    </MareaPage>
  );
}
