// Cada persona decide si comparte su estado general (HU-30).
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { t } from "@/i18n";
import { isShared, setShared, useShared } from "./privacy";

export function PrivacyCard({ me }: { me: string }) {
  const shared = useShared();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("crew.privacy.title")}</CardTitle>
        <CardDescription>{t("crew.privacy.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <label className="flex min-h-12 cursor-pointer items-center gap-3 text-base">
          <input
            type="checkbox"
            className="size-6 shrink-0 accent-primary"
            checked={isShared(shared, me)}
            onChange={(e) => setShared(me, e.target.checked)}
          />
          {t("crew.privacy.share")}
        </label>
      </CardContent>
    </Card>
  );
}
