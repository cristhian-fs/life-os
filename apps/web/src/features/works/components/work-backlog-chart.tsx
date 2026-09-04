import type { WorkAnalyticsBacklogResponse } from '#/types/api'
import { EvilBarChart } from '#/components/evilcharts/charts/recharts-bar-chart'
import type { ChartConfig } from '#/components/evilcharts/ui/recharts-chart'
import {
  ChartTooltip,
  ChartTooltipContent,
} from '#/components/evilcharts/ui/recharts-tooltip'
import { format, parseISO } from 'date-fns'
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
      colors: { light: ['var(--primary)'], dark: ['var(--primary)'] },
    },
  } satisfies ChartConfig

  return (
    <EvilBarChart
      data={data}
      config={chartConfig}
      className="aspect-auto h-48 w-full"
    >
      <EvilBarChart.Grid />
      <EvilBarChart.XAxis
        dataKey="bucket_start"
        tickFormatter={formatTick}
        minTickGap={24}
      />
      <EvilBarChart.YAxis allowDecimals={false} width={32} />
      <ChartTooltip
        cursor={false}
        content={
          <ChartTooltipContent labelFormatter={(v) => formatTick(String(v))} />
        }
      />
      <EvilBarChart.Bar dataKey="count" variant="gradient" />
    </EvilBarChart>
  )
}
