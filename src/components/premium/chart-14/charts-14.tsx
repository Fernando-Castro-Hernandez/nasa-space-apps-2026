// Adaptado de chart-14 (Shadcn Space Pro, revisión d92661d704a1): gráfica de
// área de 7 días con la línea base personal punteada.
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export type DayPoint = { day: string; value: number };

type Props = {
  label: string;
  unit: string;
  data: DayPoint[];
  baseline: number;
};

export function WeekAreaChart({ label, unit, data, baseline }: Props) {
  const config = {
    value: { label: `${label} (${unit})`, color: "var(--primary)" },
  } satisfies ChartConfig;

  return (
    <ChartContainer className="h-56 w-full" config={config}>
      <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tickMargin={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={48}
          domain={["dataMin - 2", "dataMax + 2"]}
          tickFormatter={(v: number) => String(Math.round(v))}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ReferenceLine
          y={baseline}
          stroke="var(--muted-foreground)"
          strokeDasharray="4 4"
          label={{
            value: "tu normal",
            position: "insideTopRight",
            fontSize: 11,
            fill: "var(--muted-foreground)",
          }}
        />
        <defs>
          <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-value)"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="var(--color-value)"
              stopOpacity={0.05}
            />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          fill="url(#fillValue)"
          strokeWidth={2.5}
          dot={false}
          activeDot={{
            r: 5,
            strokeWidth: 2,
            stroke: "var(--color-value)",
            fill: "var(--card)",
          }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
