import { useHabit } from '#/features/habits/api/get-habit'
import { useHabitBestStreaks } from '#/features/habits/api/get-habit-best-streaks'
import { useHabitCalendarMap } from '#/features/habits/api/get-habit-calendar-map'
import { useHabitHistoryBar } from '#/features/habits/api/get-habit-history-bar'
import { useHabitScoreHistory } from '#/features/habits/api/get-habit-score-history'
import { useCheckInHabit } from '#/features/habits/api/use-check-in-habit'
import { HabitActionsMenu } from '#/features/habits/components/habit-actions-menu'
import { HabitBestStreaksChart } from '#/features/habits/components/habit-best-streaks-chart'
import { HabitCalendarHeatmap } from '#/features/habits/components/habit-calendar-heatmap'
import {
  HabitHistoryBarChart,
  HabitScoreHistoryChart,
} from '#/features/habits/components/habit-charts'
import { NumericCheckIn } from '#/features/habits/components/numeric-check-in'
import { formatGoal } from '#/features/habits/lib/format'
import {
  deriveStreaks,
  isDoneToday,
} from '#/features/habits/lib/habit-progress'
import { HabitStatus, HabitType } from '#/types/api'
import type { HabitPeriodRequest } from '#/types/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { StatTile } from '@/components/stat-tile'
import { CheckCircleIcon } from '@phosphor-icons/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/dashboard/habits/$habitId')({
  component: RouteComponent,
})

// Plain array since HabitPeriodRequest has no runtime enum to enumerate.
const PERIODS: HabitPeriodRequest[] = [
  'week',
  'month',
  '3months',
  '6months',
  'year',
  'all',
]

function RouteComponent() {
  const { habitId } = Route.useParams()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<HabitPeriodRequest>('month')

  const { t } = useTranslation('translations')

  function periodLabel(value: HabitPeriodRequest): string {
    switch (value) {
      case 'week':
        return t('habits.detail.period.week')
      case 'month':
        return t('habits.detail.period.month')
      case '3months':
        return t('habits.detail.period.3months')
      case '6months':
        return t('habits.detail.period.6months')
      case 'year':
        return t('habits.detail.period.year')
      case 'all':
        return t('habits.detail.period.all')
    }
  }
  const habit = useHabit({ habitId })
  const bestStreaks = useHabitBestStreaks({ habitId })
  const scoreHistory = useHabitScoreHistory({ params: { id: habitId, period } })
  // The bar chart counts accomplished days per bucket — only informative
  // once a bucket spans more than a day (the API buckets 'week'/'month' by
  // day, same as the line chart above, so "count" there can only ever be 0
  // or 1: a duplicate of the completion line with less resolution).
  const showHistoryBar = period !== 'week' && period !== 'month'
  const historyBar = useHabitHistoryBar({
    params: { id: habitId, period },
    queryConfig: { enabled: showHistoryBar },
  })
  const calendarMap = useHabitCalendarMap({ habitId })
  const checkIn = useCheckInHabit(habitId)

  if (habit.isLoading || !habit.data) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const h = habit.data
  const isActive = h.status === HabitStatus.ACTIVE
  const done = isDoneToday(h, checkIn.todayEntry)
  const { bestStreak, currentStreak } = deriveStreaks(bestStreaks.data)
  const avgCompletion = scoreHistory.data?.length
    ? Math.round(
        scoreHistory.data.reduce((sum, p) => sum + p.percentage, 0) /
          scoreHistory.data.length,
      )
    : 0

  return (
    <div className="flex flex-col gap-6 p-2 py-8">
      <div className="mx-auto max-w-4xl w-full flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium">{h.name}</h2>
              {!isActive && (
                <Badge variant="warning">{t('habits.status.archived')}</Badge>
              )}
            </div>
            {h.description && (
              <p className="text-xs text-muted-foreground">{h.description}</p>
            )}
            <p className="text-xs text-muted-foreground">{formatGoal(h)}</p>
          </div>
          <div className="flex items-center gap-2">
            {isActive && h.type === HabitType.BOOLEAN && (
              <Button
                variant={done ? 'default' : 'secondary'}
                disabled={checkIn.isLoading || checkIn.isSaving}
                onClick={() => checkIn.checkIn({ value_boolean: !done })}
              >
                <CheckCircleIcon weight={done ? 'fill' : 'regular'} />
                {done ? t('habits.card.doneToday') : t('habits.card.markDone')}
              </Button>
            )}
            <HabitActionsMenu
              habit={h}
              onDeleted={() => navigate({ to: '/dashboard/habits' })}
            />
          </div>
        </div>
        {isActive && h.type === HabitType.NUMERIC && (
          <NumericCheckIn habit={h} checkIn={checkIn} variant="row" />
        )}
      </div>

      <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="grid grid-cols-3">
            <StatTile
              label={t('habits.detail.currentStreak')}
              value={currentStreak}
              suffix="days"
            />
            <StatTile
              label={t('habits.detail.bestStreak')}
              value={bestStreak}
              suffix="days"
            />
            <StatTile
              label={periodLabel(period)}
              value={avgCompletion}
              suffix="% completion"
              loading={scoreHistory.isLoading}
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                {t('habits.detail.history')}
              </h3>
              <Select
                value={period}
                onValueChange={(v) => setPeriod(v as HabitPeriodRequest)}
              >
                <SelectTrigger size="sm">
                  <SelectValue>
                    {(value: HabitPeriodRequest) => periodLabel(value)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {periodLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {scoreHistory.isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="h-48 w-full">
                <HabitScoreHistoryChart data={scoreHistory.data ?? []} />
              </div>
            )}
            {showHistoryBar &&
              (historyBar.isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <div className="h-48 w-full">
                  <HabitHistoryBarChart data={historyBar.data ?? []} />
                </div>
              ))}
          </div>

          <Separator />

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-medium">
              {t('habits.detail.bestStreaks')}
            </h3>
            {bestStreaks.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <HabitBestStreaksChart data={bestStreaks.data ?? []} />
            )}
          </div>

          <Separator />

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-medium">
              {t('habits.detail.lifetime')}
            </h3>
            {calendarMap.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <HabitCalendarHeatmap habit={h} data={calendarMap.data ?? []} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
