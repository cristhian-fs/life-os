import type { MonthlyPurchaseCountsResponse } from '#/types/api'
import { EvilLineChart } from '#/components/evilcharts/charts/recharts-line-chart'
import type { ChartConfig } from '#/components/evilcharts/ui/recharts-chart'
import {
  ChartTooltip,
  ChartTooltipContent,
} from '#/components/evilcharts/ui/recharts-tooltip'
import { format, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'

function formatTick(date: string) {
  return format(parseISO(date), 'MMM')
}

/** Items created vs. purchased per month, for the selected year. */
export function PurchaseWishlistMonthlyChart({
  data,
}: {
  data: MonthlyPurchaseCountsResponse
}) {
  const { t } = useTranslation()
  const chartConfig = {
    created: {
      label: t('purchaseWishlist.chart.created'),
      colors: { light: ['var(--muted-foreground)'], dark: ['var(--muted-foreground)'] },
    },
    purchased: {
      label: t('purchaseWishlist.chart.purchased'),
      colors: { light: ['var(--primary)'], dark: ['var(--primary)'] },
    },
  } satisfies ChartConfig

  return (
    <EvilLineChart data={data} config={chartConfig} className="h-48 w-full">
      <EvilLineChart.Grid />
      <EvilLineChart.XAxis
        dataKey="month"
        tickFormatter={formatTick}
        minTickGap={24}
      />
      <EvilLineChart.YAxis allowDecimals={false} width={32} />
      <EvilLineChart.Legend />
      <ChartTooltip
        cursor={false}
        content={
          <ChartTooltipContent labelFormatter={(v) => formatTick(String(v))} />
        }
      />
      <EvilLineChart.Line dataKey="created" curveType="monotone" />
      <EvilLineChart.Line dataKey="purchased" curveType="monotone" />
    </EvilLineChart>
  )
}
