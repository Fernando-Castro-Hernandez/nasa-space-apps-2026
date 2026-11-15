import { ProfilesScreen } from "./ProfilesScreen";
import { PrivacyCard } from "@/features/crew/PrivacyCard";
import { useActiveProfile } from "./activeProfile";

export function SettingsScreen() {
  const me = useActiveProfile();
  return (
    <div className="orbita-settings">
      <ProfilesScreen />
      <PrivacyCard me={me} />
      <section className="orbita-panel flex flex-col gap-4" aria-label="Misión">
        <a href="/tierra" className="orbita-setting-link">
          Consola de Tierra <span aria-hidden="true">→</span>
        </a>
        <a href="/demo" className="orbita-setting-link">
          Panel de la demo <span aria-hidden="true">→</span>
        </a>
        <a href="/referencia" className="orbita-setting-link">
          Inicio de referencia <span aria-hidden="true">→</span>
        </a>
      </section>
    </div>
  );
}
