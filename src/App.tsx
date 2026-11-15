import { useEffect } from "react";
import AppShell from "@/components/premium/dashboard-shell-03/app-sidebar";
import { findRoute, NAV, SUBTITLE } from "@/app/routes";
import { interceptLinks, usePathname } from "@/app/router";

const appEnv = import.meta.env.VITE_APP_ENV ?? "local";
const commit = import.meta.env.VITE_COMMIT_SHA?.slice(0, 7) ?? "dev";

export function App() {
  const route = findRoute(usePathname());
  useEffect(interceptLinks, []);
  useEffect(() => {
    document.title = `${route.title} · Health Monitor`;
  }, [route.title]);

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
