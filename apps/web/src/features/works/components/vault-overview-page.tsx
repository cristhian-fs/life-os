import { useWorkAvgWishlistWait } from '#/features/works/api/get-work-avg-wishlist-wait'
import { useWorkBacklog } from '#/features/works/api/get-work-backlog'
import { useWorkCompletedCount } from '#/features/works/api/get-work-completed-count'
import { useWorkConversionFunnel } from '#/features/works/api/get-work-conversion-funnel'
import { WorkBacklogChart } from '#/features/works/components/work-backlog-chart'
import { WorkConversionFunnelChart } from '#/features/works/components/work-conversion-funnel-chart'
import {
  bucketUnitForPreset,
  DATE_RANGE_PRESETS,
  dateRangeForPreset,
  dateRangePresetLabel,
} from '#/features/works/lib/date-range-presets'
import type { DateRangePreset } from '#/features/works/lib/date-range-presets'
import { formatWishlistWait } from '#/features/works/lib/format'
import { StatTile } from '@/components/stat-tile'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const EMPTY_FUNNEL = { entered: 0, in_progress: 0, completed: 0, abandoned: 0 }

/** Vault landing page — how items are moving through the shelf. */
export function VaultOverviewPage() {
  const { t } = useTranslation()
  const [preset, setPreset] = useState<DateRangePreset>('90D')
  const { from, to } = useMemo(() => dateRangeForPreset(preset), [preset])
  const bucketUnit = bucketUnitForPreset(preset)

  const backlog = useWorkBacklog({ params: { from, to, bucketUnit } })
  const funnel = useWorkConversionFunnel({ params: { from, to } })
  const completedCount = useWorkCompletedCount({ params: { from, to } })
  const avgWait = useWorkAvgWishlistWait({ params: { from, to } })

  return (
    <div className="px-2 py-6">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 p-6">
        <div>
          <h2 className="text-2xl font-medium tracking-tight">
            {t('work.overview.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('work.overview.description')}
          </p>
        </div>
        <Select
          value={preset}
          onValueChange={(v) => setPreset(v as DateRangePreset)}
        >
          <SelectTrigger size="sm" className="w-fit">
            <SelectValue>{(value: DateRangePreset) => value}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_PRESETS.map((p) => (
              <SelectItem
                key={p}
                value={p}
                aria-label={dateRangePresetLabel(p)}
              >
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2">
              <StatTile
                label={t('work.overview.completed')}
                value={completedCount.data?.count ?? 0}
                suffix={t('work.overview.itemsSuffix')}
                loading={completedCount.isLoading}
              />
              <StatTile
                label={t('work.overview.avgWaitToStart')}
                value={formatWishlistWait(avgWait.data?.avg_seconds ?? null)}
                suffix=""
                loading={avgWait.isLoading}
              />
            </div>

            <Separator />

            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-medium">
                {t('work.overview.backlogOverTime')}
              </h3>
              {backlog.isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <WorkBacklogChart data={backlog.data ?? []} />
              )}
            </div>

            <Separator />

            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-medium">
                {t('work.overview.conversionFunnel')}
              </h3>
              {funnel.isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <WorkConversionFunnelChart data={funnel.data ?? EMPTY_FUNNEL} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
