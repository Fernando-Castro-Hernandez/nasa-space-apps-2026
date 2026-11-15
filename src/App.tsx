import { useEffect, useState } from "react";
import AppShell from "@/components/premium/dashboard-shell-03/app-sidebar";
import { findRoute, NAV, SUBTITLE } from "@/app/routes";
import { interceptLinks, navigate, usePathname } from "@/app/router";
import { finishDayStart, needsDayStart } from "@/app/dayStart";
import { DayCheckInScreen } from "@/features/day-checkin/DayCheckInScreen";

const appEnv = import.meta.env.VITE_APP_ENV ?? "local";
const commit = import.meta.env.VITE_COMMIT_SHA?.slice(0, 7) ?? "dev";

export function App() {
  const pathname = usePathname();
  const route = findRoute(pathname);
  const [dayPending, setDayPending] = useState(needsDayStart);
  useEffect(interceptLinks, []);
  useEffect(() => {
    document.title = `${route.title} · Nóstos`;
  }, [route.title]);

  // The morning check-in only gates the reference Inicio, never Órbita.
  if (
    pathname === "/buenos-dias" ||
    (route.path === "/referencia" && dayPending)
  ) {
    const completeDay = () => {
      finishDayStart();
      setDayPending(false);
      navigate("/referencia");
    };
    return <DayCheckInScreen onDone={completeDay} />;
  }

  const { Screen } = route;
  if (!route.shell) return <Screen />;

  return (
    <AppShell
      nav={NAV}
      pathname={route.path}
      title={route.title}
      subtitle={SUBTITLE}
      hideEmergency={route.path === "/emergencia"}
    >
      <Screen />
      <p
        className="px-6 pb-4 text-center text-xs text-muted-foreground"
        data-testid="build-info"
      >
        Entorno: <strong>{appEnv}</strong> · Commit: <strong>{commit}</strong>
      </p>
    </AppShell>
  );
}
