// Cada persona decide si comparte su estado general (HU-30).
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isShared, setShared, useShared } from "./privacy";

export function PrivacyCard({ me }: { me: string }) {
  const shared = useShared();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tu privacidad</CardTitle>
        <CardDescription>
          Solo se comparte tu estado general, sin cifras ni motivos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="size-5 accent-primary"
            checked={isShared(shared, me)}
            onChange={(e) => setShared(me, e.target.checked)}
          />
          Compartir mi estado con la tripulación
        </label>
      </CardContent>
    </Card>
  );
}
