// Selección de perfil (HU-01): un Lunito por tripulante, con nombre y rol,
// sin contraseñas. Al elegir, el perfil queda activo y se vuelve a Inicio.
import { Check } from "lucide-react";
import { navigate } from "@/app/router";
import { CREW } from "@/data/crew";
import lunito from "@/features/day-checkin/assets/lunito-pregunta.webp";
import { t } from "@/i18n";
import { setActiveProfile, useActiveProfile } from "./activeProfile";
import "./profiles.css";

export function ProfilesScreen() {
  const active = useActiveProfile();

  return (
    <div className="profiles">
      <h2>{t("profiles.title")}</h2>
      <p>{t("profiles.hint")}</p>
      <ul>
        {CREW.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              aria-pressed={c.id === active}
              onClick={() => {
                setActiveProfile(c.id);
                navigate("/");
              }}
            >
              <img src={lunito} alt="" />
              <strong>{c.name}</strong>
              <span>{c.role}</span>
              {c.id === active && (
                <Check aria-hidden="true" className="profiles-check" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
