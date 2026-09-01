import { useHabitsProgressSummary } from '#/features/habits/api/get-habits-progress-summary'
import { HabitsMissingToday } from '#/features/habits/components/habits-missing-today'
import { usePendingWishlistSummary } from '#/features/purchase-wishlist/api/get-pending-wishlist-summary'
import { useWorkConsumptionSummary } from '#/features/works/api/get-work-consumption-summary'
import { WorkInProgressList } from '#/features/works/components/work-in-progress-list'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { StatTile } from '@/components/stat-tile'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  const progress = useHabitsProgressSummary()
  const consumption = useWorkConsumptionSummary()
  const wishlist = usePendingWishlistSummary()

  const streaksWithProgress = progress.data?.streaks.filter(
    (s) => s.streak !== null,
  )

  return (
    <div className="px-2 py-6">
      <div className="mx-auto w-full max-w-4xl p-6">
        <h2 className="text-2xl font-medium tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Where things stand today, across habits, the vault, and your wishlist.
        </p>
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-medium">Progress</h3>
            <div className="px-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <StatTile
                label="This week"
                value={Math.round(progress.data?.week_conclusion_tax ?? 0)}
                suffix="%"
                loading={progress.isLoading}
              />
              <StatTile
                label="This month"
                value={Math.round(progress.data?.month_conclusion_tax ?? 0)}
                suffix="%"
                loading={progress.isLoading}
              />
              <StatTile
                label="Consumed"
                value={consumption.data?.consumed_this_month ?? 0}
                suffix="this month"
                loading={consumption.isLoading}
              />
              <StatTile
                label="Backlog"
                value={consumption.data?.backlog_now ?? 0}
                suffix="items"
                loading={consumption.isLoading}
              />
              <StatTile
                label="Wishlist pending"
                value={wishlist.data?.pending_count ?? 0}
                suffix="items"
                loading={wishlist.isLoading}
              />
              <StatTile
                label="Wishlist total"
                value={(
                  (wishlist.data?.pending_total_estimated_cents ?? 0) / 100
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                suffix=""
                loading={wishlist.isLoading}
              />
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">In progress</h3>
            <WorkInProgressList />
          </div>

          <Separator />

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">Missing today</h3>
              <HabitsMissingToday />
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">Current streaks</h3>
              {!progress.isLoading && streaksWithProgress?.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No habit is on a streak right now.
                </p>
              )}
              <div className="flex flex-col gap-2">
                {streaksWithProgress?.map((entry) => (
                  <Card key={entry.habit_id} size="sm">
                    <CardContent className="flex items-center justify-between">
                      <Link
                        to="/dashboard/habits/$habitId"
                        params={{ habitId: entry.habit_id }}
                        className="text-sm hover:underline"
                      >
                        {entry.habit_name}
                      </Link>
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {entry.streak?.streak_num} day
                        {entry.streak?.streak_num === 1 ? '' : 's'}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
