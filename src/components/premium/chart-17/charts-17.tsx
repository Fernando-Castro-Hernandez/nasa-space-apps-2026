// Adaptado de chart-17 (Shadcn Space Pro, revisión 64c4fff6b7fd): barras por
// semana comparando tu promedio con tu línea base. Sin @iconify.
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export type WeekPoint = { week: string; value: number; baseline: number };

type Props = { label: string; unit: string; data: WeekPoint[] };

export function MonthBarsChart({ label, unit, data }: Props) {
  const config = {
    value: { label: `${label} (${unit})`, color: "var(--primary)" },
    baseline: { label: "Tu normal", color: "var(--chart-5)" },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-primary" />
          Tu promedio
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-chart-5" />
          Tu normal
        </span>
      </div>
      <ChartContainer config={config} className="h-56 w-full">
        <BarChart
          accessibilityLayer
          data={data}
          barGap={6}
          margin={{ left: -20 }}
        >
          <XAxis
            dataKey="week"
            tickLine={false}
            tickMargin={6}
            axisLine={false}
          />
          <YAxis
            tickLine={false}
            tickMargin={4}
            axisLine={false}
            width={48}
            domain={["dataMin - 4", "dataMax + 4"]}
            tickFormatter={(v: number) => String(Math.round(v))}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="value"
            fill="var(--color-value)"
            radius={6}
            barSize={14}
          />
          <Bar
            dataKey="baseline"
            fill="var(--color-baseline)"
            radius={6}
            barSize={14}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
