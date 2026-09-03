import { useHabitBestStreaks } from '#/features/habits/api/get-habit-best-streaks'
import { useHabitCalendarMap } from '#/features/habits/api/get-habit-calendar-map'
import { useCheckInHabit } from '#/features/habits/api/use-check-in-habit'
import { NumericCheckIn } from '#/features/habits/components/numeric-check-in'
import { formatGoal, formatWeekdays } from '#/features/habits/lib/format'
import {
  deriveStreaks,
  isDoneToday,
} from '#/features/habits/lib/habit-progress'
import { HabitType, HabitStatus } from '#/types/api'
import type { Habit } from '#/types/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CheckIcon, ListChecksIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { HabitActionsMenu } from './habit-actions-menu'
import { HabitCalendarHeatmap } from './habit-calendar-heatmap'

export function HabitCard({ habit }: { habit: Habit }) {
  const { t } = useTranslation()
  const isActive = habit.status === HabitStatus.ACTIVE
  const checkIn = useCheckInHabit(habit.id)
  const bestStreaks = useHabitBestStreaks({ habitId: habit.id })
  const calendarMap = useHabitCalendarMap({ habitId: habit.id })

  const done = isDoneToday(habit, checkIn.todayEntry)
  const { bestStreak, currentStreak } = deriveStreaks(bestStreaks.data)
  const avgCompletion = calendarMap.data?.length
    ? Math.round(
        calendarMap.data.reduce((sum, p) => sum + Number(p.percentage), 0) /
          calendarMap.data.length,
      )
    : 0

  return (
    <Card className="bg-transparent">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {isActive && habit.type === HabitType.BOOLEAN ? (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'size-9 shrink-0 rounded-full',
                done
                  ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                  : 'bg-muted text-transparent hover:text-muted-foreground',
              )}
              disabled={checkIn.isLoading || checkIn.isSaving}
              aria-pressed={done}
              aria-label={
                done ? t('habits.card.doneToday') : t('habits.card.markDone')
              }
              onClick={() => checkIn.checkIn({ value_boolean: !done })}
            >
              <CheckIcon weight="bold" />
            </Button>
          ) : (
            <div
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-full',
                done
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-transparent',
              )}
              aria-hidden
            >
              <CheckIcon weight="bold" />
            </div>
          )}
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <ListChecksIcon className="size-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <Link
              to="/dashboard/habits/$habitId"
              params={{ habitId: habit.id }}
              className="block truncate rounded-sm text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {habit.name}
            </Link>
            <p className="truncate text-[11px] text-muted-foreground">
              {formatGoal(habit)}
            </p>
          </div>
          {!isActive && (
            <Badge variant="warning">{t('habits.status.archived')}</Badge>
          )}
          <HabitActionsMenu habit={habit} />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={currentStreak > 0 ? 'default' : 'secondary'}>
            {currentStreak > 0
              ? t('habits.card.streak', { count: currentStreak })
              : t('habits.card.noStreak')}
          </Badge>
          <Badge variant="secondary">
            {t('habits.card.best', { count: bestStreak })}
          </Badge>
          <Badge variant="secondary">{avgCompletion}%</Badge>
          <Badge variant="secondary">{formatWeekdays(habit)}</Badge>
        </div>

        <HabitCalendarHeatmap
          habit={habit}
          data={calendarMap.data ?? []}
          size="default"
        />

        {isActive && habit.type === HabitType.NUMERIC && (
          <NumericCheckIn habit={habit} checkIn={checkIn} variant="compact" />
        )}
      </CardContent>
    </Card>
  )
}
