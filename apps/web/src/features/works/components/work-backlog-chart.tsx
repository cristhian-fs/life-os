import type { WorkAnalyticsBacklogResponse } from '#/types/api'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import { format, parseISO } from 'date-fns'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { useTranslation } from 'react-i18next'

function formatTick(date: string) {
  return format(parseISO(date), 'MMM d')
}

/** Backlog volume (items still to_consume) bucketed over time. */
export function WorkBacklogChart({
  data,
}: {
  data: WorkAnalyticsBacklogResponse
}) {
  const { t } = useTranslation()
  const chartConfig = {
    count: {
      label: t('work.overview.toConsumeItemsSeries'),
      color: 'var(--primary)',
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-48 w-full">
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="bucket_start"
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
