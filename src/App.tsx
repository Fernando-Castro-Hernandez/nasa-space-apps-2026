// Pantalla provisional de la plantilla. Se reemplaza cuando el equipo
// defina el producto; aquí no hay lógica del reto todavía.
const appEnv = import.meta.env.VITE_APP_ENV ?? "local";
const commit = import.meta.env.VITE_COMMIT_SHA?.slice(0, 7) ?? "dev";

export function App() {
  return (
    <main className="shell">
      <p className="eyebrow">NASA Space Apps Challenge 2026</p>
      <h1>Health Monitor</h1>
      <p className="lead">
        Plantilla lista. El producto aún no está definido: revisa{" "}
        <code>docs/BRIEF.md</code> y <code>docs/DECISIONS.md</code>.
      </p>
      <p className="build" data-testid="build-info">
        Entorno: <strong>{appEnv}</strong> · Commit: <strong>{commit}</strong>
      </p>
    </main>
  );
}
