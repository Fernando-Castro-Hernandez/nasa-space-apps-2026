import { useEffect } from "react";
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

const completeDay = () => {
  finishDayStart();
  navigate("/");
};

// "Ahora no": Inicio deja de pedir el check-in durante esta sesión.
const skipDay = () => {
  snoozeDayStart();
  navigate("/");
};

export function App() {
  const pathname = usePathname();
  const redirectTo = redirectFor(pathname);
  const path = redirectTo ?? pathname;
  const route = findRoute(path);
  const dayDue = useDayStartDue();
  const activeCase = useActiveCase();
  // El día empieza con el check-in de la mañana antes de Inicio, salvo que
  // haya una emergencia en curso: entonces Inicio no se interpone.
  const dayStart =
    path === "/buenos-dias" || (route.path === "/" && dayDue && !activeCase);
  const title = dayStart ? t("shell.titles.dayStart") : route.title;

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
