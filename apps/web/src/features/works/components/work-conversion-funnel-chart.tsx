import {
  workFunnelStageColor,
  workFunnelStageLabel,
} from '#/features/works/lib/format'
import type { WorkConversionFunnelResponse } from '#/types/api'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts'

const chartConfig = {
  count: { label: 'Items' },
} satisfies ChartConfig

/** entered -> in_progress -> completed/abandoned, one bar per stage, colored
 * by the same status semantics as the badge/dot used everywhere else. */
export function WorkConversionFunnelChart({
  data,
}: {
  data: WorkConversionFunnelResponse
}) {
  const stages = (
    ['entered', 'in_progress', 'completed', 'abandoned'] as const
  ).map((stage) => ({
    stage,
    label: workFunnelStageLabel[stage],
    count: data[stage],
  }))

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-40 w-full">
      <BarChart
        data={stages}
        layout="vertical"
        margin={{ left: 0, right: 24, top: 8, bottom: 0 }}
      >
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          dataKey="label"
          type="category"
          tickLine={false}
          axisLine={false}
          width={88}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent labelFormatter={(v) => v} />}
        />
        <Bar dataKey="count" radius={4}>
          {stages.map((s) => (
            <Cell key={s.stage} fill={workFunnelStageColor[s.stage]} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
