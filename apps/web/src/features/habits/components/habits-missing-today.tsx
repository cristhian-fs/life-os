import { useCheckInHabit } from '#/features/habits/api/use-check-in-habit'
import { useHabitsToday } from '#/features/habits/api/get-habits-today'
import { NumericCheckIn } from '#/features/habits/components/numeric-check-in'
import { formatGoal } from '#/features/habits/lib/format'
import { HabitType, type Habit } from '#/types/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckIcon, ListChecksIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'

// Same boolean-button / NumericCheckIn split HabitCard uses — copied rather
// than shared, since the two call sites' surrounding layout differs enough
// that a shared abstraction would need its own prop surface anyway.
function MissingTodayCard({ habit }: { habit: Habit }) {
  const checkIn = useCheckInHabit(habit.id)

  return (
    <Card size="sm" className="bg-transparent">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {habit.type === HabitType.BOOLEAN ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-full bg-muted text-base text-muted-foreground hover:bg-muted/70"
              disabled={checkIn.isLoading || checkIn.isSaving}
              aria-label="Mark done"
              onClick={() => checkIn.checkIn({ value_boolean: true })}
            >
              {habit.icon ?? <CheckIcon weight="bold" />}
            </Button>
          ) : (
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-base text-muted-foreground"
              aria-hidden
            >
              {habit.icon ?? <ListChecksIcon className="size-4" />}
            </div>
          )}
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
        </div>
        {habit.type === HabitType.NUMERIC && (
          <NumericCheckIn habit={habit} checkIn={checkIn} variant="compact" />
        )}
      </CardContent>
    </Card>
  )
}

/** "Missing today" widget for the dashboard overview — habits with no entry
 * logged yet today, checkable right here. Owns its own query so the route
 * stays layout-only; checking in invalidates ['habits','today'] (see
 * use-check-in-habit.ts), so a habit drops off this list once logged. */
export function HabitsMissingToday() {
  const habitsToday = useHabitsToday()

  if (habitsToday.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 2 }, (_, i) => (
          <Skeleton key={i} className="h-[52px] rounded-lg" />
        ))}
      </div>
    )
  }

  if (habitsToday.data?.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Every active habit has an entry today.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {habitsToday.data?.map((habit) => (
        <MissingTodayCard key={habit.id} habit={habit} />
      ))}
    </div>
  )
}
