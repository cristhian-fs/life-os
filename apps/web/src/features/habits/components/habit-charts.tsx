import type {
  HabitHistoryBarGraphResponse,
  HabitScoreHistoryResponse,
} from '#/types/api'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import { format, parseISO } from 'date-fns'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'

const scoreConfig = {
  percentage: { label: 'Completion', color: 'var(--primary)' },
} satisfies ChartConfig

const countConfig = {
  count: { label: 'Days done', color: 'var(--primary)' },
} satisfies ChartConfig

function formatTick(date: string) {
  return format(parseISO(date), 'MMM d')
}

export function HabitScoreHistoryChart({
  data,
}: {
  data: HabitScoreHistoryResponse
}) {
  return (
    <ChartContainer config={scoreConfig} className="aspect-auto h-48 w-full">
      <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatTick}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={32} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(v) => formatTick(String(v))}
            />
          }
        />
        <Line
          dataKey="percentage"
          type="monotone"
          stroke="var(--color-percentage)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}

export function HabitHistoryBarChart({
  data,
}: {
  data: HabitHistoryBarGraphResponse
}) {
  return (
    <ChartContainer config={countConfig} className="aspect-auto h-48 w-full">
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatTick}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(v) => formatTick(String(v))}
            />
          }
        />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
