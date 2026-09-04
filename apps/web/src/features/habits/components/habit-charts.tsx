import type {
  HabitHistoryBarGraphResponse,
  HabitScoreHistoryResponse,
} from '#/types/api'
import { EvilLineChart } from '#/components/evilcharts/charts/recharts-line-chart'
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

function DateTooltip() {
  return (
    <ChartTooltip
      cursor={false}
      content={
        <ChartTooltipContent labelFormatter={(v) => formatTick(String(v))} />
      }
    />
  )
}

export function HabitScoreHistoryChart({
  data,
}: {
  data: HabitScoreHistoryResponse
}) {
  const { t } = useTranslation()
  const scoreConfig = {
    percentage: {
      label: t('habits.detail.completion'),
      colors: { light: ['var(--primary)'], dark: ['var(--primary)'] },
    },
  } satisfies ChartConfig

  return (
    <EvilLineChart data={data} config={scoreConfig} className="h-full w-full">
      <EvilLineChart.Grid />
      <EvilLineChart.XAxis
        dataKey="date"
        tickFormatter={formatTick}
        minTickGap={24}
      />
      <EvilLineChart.YAxis domain={[0, 100]} width={32} />
      <DateTooltip />
      <EvilLineChart.Line dataKey="percentage" curveType="monotone" />
    </EvilLineChart>
  )
}

export function HabitHistoryBarChart({
  data,
}: {
  data: HabitHistoryBarGraphResponse
}) {
  const { t } = useTranslation()
  const countConfig = {
    count: {
      label: t('habits.detail.daysDone'),
      colors: { light: ['var(--primary)'], dark: ['var(--primary)'] },
    },
  } satisfies ChartConfig

  return (
    <EvilBarChart data={data} config={countConfig} className="h-full w-full">
      <EvilBarChart.Grid />
      <EvilBarChart.XAxis
        dataKey="date"
        tickFormatter={formatTick}
        minTickGap={24}
      />
      <EvilBarChart.YAxis allowDecimals={false} width={32} />
      <DateTooltip />
      <EvilBarChart.Bar dataKey="count" variant="gradient" />
    </EvilBarChart>
  )
}
