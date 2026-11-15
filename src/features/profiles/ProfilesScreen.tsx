// Selección de perfil (HU-01): botones grandes con nombre e inicial, sin
// contraseñas. Al elegir, el perfil queda activo y se vuelve a Mi Lunito.
import { navigate } from "@/app/router";
import { CREW } from "@/data/crew";
import { setActiveProfile, useActiveProfile } from "./activeProfile";

export function ProfilesScreen() {
  const active = useActiveProfile();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4 md:p-6">
      <div>
        <h2 className="text-2xl font-semibold">¿Quién eres?</h2>
        <p className="text-sm text-muted-foreground">
          Elige tu perfil: tus check-ins se guardan a tu nombre.
        </p>
      </div>
      <ul className="orbita-profiles grid grid-cols-2 gap-4">
        {CREW.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              aria-pressed={c.id === active}
              onClick={() => {
                setActiveProfile(c.id);
                navigate("/");
              }}
              className="flex min-h-12 w-full flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring aria-pressed:border-primary aria-pressed:ring-2 aria-pressed:ring-primary"
            >
              <span
                className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground"
                aria-hidden="true"
              >
                {c.name[0]}
              </span>
              <span className="font-semibold">{c.name}</span>
              <span className="text-xs text-muted-foreground">{c.role}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
