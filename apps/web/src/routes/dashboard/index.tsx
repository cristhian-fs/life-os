import { useHabitsProgressSummary } from '#/features/habits/api/get-habits-progress-summary'
import { HabitsMissingToday } from '#/features/habits/components/habits-missing-today'
import { usePendingWishlistSummary } from '#/features/purchase-wishlist/api/get-pending-wishlist-summary'
import { useWorkConsumptionSummary } from '#/features/works/api/get-work-consumption-summary'
import { WorkInProgressList } from '#/features/works/components/work-in-progress-list'
import { Card, CardContent } from '@/components/ui/card'
import { StatTile } from '@/components/stat-tile'
import {
  ListBulletsIcon,
  ListChecksIcon,
  PlusIcon,
  VaultIcon,
} from '@phosphor-icons/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { HabitFormDialog } from '#/features/habits/components/habit-form-dialog'
import { Button } from '#/components/ui/button'
import { ButtonGroup } from '#/components/ui/button-group'
import { WorkFormDialog } from '#/features/works/components/work-form-dialog'
import { workFormNewTitle } from '#/features/works/lib/format'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { WorkType } from '#/types/api'
import { PurchaseWishlistFormDialog } from '#/features/purchase-wishlist/components/purchase-wishlist-form-dialog'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
})

// Same icon each domain already uses in the sidebar — one glance ties this
// section back to where it lives in the nav, no separate legend needed.
function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: typeof ListChecksIcon
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-muted-foreground" />
      <h3 className="text-sm font-semibold">{children}</h3>
    </div>
  )
}

function RouteComponent() {
  const { t } = useTranslation()
  const progress = useHabitsProgressSummary()
  const consumption = useWorkConsumptionSummary()
  const wishlist = usePendingWishlistSummary()

  const streaksWithProgress = progress.data?.streaks.filter(
    (s) => s.streak !== null,
  )

  return (
    <div className="px-2 py-6">
      <div className="mx-auto w-full max-w-4xl p-6">
        <h2 className="text-2xl font-medium tracking-tight">
          {t('dashboard.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.description')}
        </p>
      </div>

      {/* Each domain is its own group: heading, stats, then that domain's
          lists — spacing alone (gap-12 between, gap-4/gap-3 within) marks
          the boundaries, so no topic bleeds into its neighbor. */}
      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <SectionHeading icon={ListChecksIcon}>
                {t('routes.habits')}
              </SectionHeading>
              <HabitFormDialog
                trigger={
                  <Button>
                    <PlusIcon />
                    {t('habits.emptyState.newHabit')}
                  </Button>
                }
              />
            </div>
            <div className="px-2 grid grid-cols-2 gap-2">
              <StatTile
                label={t('dashboard.stats.completedThisWeek')}
                value={Math.round(progress.data?.week_conclusion_tax ?? 0)}
                suffix="%"
                loading={progress.isLoading}
              />
              <StatTile
                label={t('dashboard.stats.completedThisMonth')}
                value={Math.round(progress.data?.month_conclusion_tax ?? 0)}
                suffix="%"
                loading={progress.isLoading}
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-medium text-muted-foreground">
                  {t('dashboard.missingToday')}
                </h4>
                <HabitsMissingToday />
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-medium text-muted-foreground">
                  {t('dashboard.currentStreaks')}
                </h4>
                {!progress.isLoading && streaksWithProgress?.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.noStreak')}
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
                          {t('dashboard.streakDays', {
                            count: entry.streak?.streak_num ?? 0,
                          })}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <SectionHeading icon={VaultIcon}>
                {t('routes.vault.index')}
              </SectionHeading>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="outline">
                      {t('dashboard.newItem')}
                      <div className="h-full flex items-center justify-center pl-1 border-l">
                        <PlusIcon />
                      </div>
                    </Button>
                  }
                />
                <DropdownMenuContent
                  side="bottom"
                  align="end"
                  className="min-w-56"
                >
                  <ButtonGroup orientation="vertical" className="w-full">
                    <DropdownMenuItem
                      render={
                        <WorkFormDialog
                          type={WorkType.ARTICLE}
                          trigger={
                            <Button
                              variant="secondary"
                              className="w-full justify-start"
                            >
                              {workFormNewTitle(WorkType.ARTICLE)}
                            </Button>
                          }
                        />
                      }
                    />
                    <DropdownMenuItem
                      render={
                        <WorkFormDialog
                          type={WorkType.BOOK}
                          trigger={
                            <Button
                              variant="secondary"
                              className="w-full justify-start"
                            >
                              {workFormNewTitle(WorkType.BOOK)}
                            </Button>
                          }
                        />
                      }
                    />
                    <DropdownMenuItem
                      render={
                        <WorkFormDialog
                          type={WorkType.COURSE}
                          trigger={
                            <Button
                              variant="secondary"
                              className="w-full justify-start"
                            >
                              {workFormNewTitle(WorkType.COURSE)}
                            </Button>
                          }
                        />
                      }
                    />
                    <DropdownMenuItem
                      render={
                        <WorkFormDialog
                          type={WorkType.MOVIE}
                          trigger={
                            <Button
                              variant="secondary"
                              className="w-full justify-start"
                            >
                              {workFormNewTitle(WorkType.MOVIE)}
                            </Button>
                          }
                        />
                      }
                    />
                    <DropdownMenuItem
                      render={
                        <WorkFormDialog
                          type={WorkType.VIDEO}
                          trigger={
                            <Button
                              variant="secondary"
                              className="w-full justify-start"
                            >
                              {workFormNewTitle(WorkType.VIDEO)}
                            </Button>
                          }
                        />
                      }
                    />
                  </ButtonGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="px-2 grid grid-cols-2 gap-2">
              <StatTile
                label={t('dashboard.stats.consumed')}
                value={consumption.data?.consumed_this_month ?? 0}
                suffix={t('dashboard.stats.consumedSuffix')}
                loading={consumption.isLoading}
              />
              <StatTile
                label={t('dashboard.stats.backlog')}
                value={consumption.data?.backlog_now ?? 0}
                suffix={t('dashboard.stats.itemsSuffix')}
                loading={consumption.isLoading}
              />
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-medium text-muted-foreground">
                {t('dashboard.inProgress')}
              </h4>
              <WorkInProgressList />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <SectionHeading icon={ListBulletsIcon}>
                {t('routes.purchaseWishlist')}
              </SectionHeading>
              <PurchaseWishlistFormDialog
                trigger={
                  <Button>
                    <PlusIcon />
                    {t('purchaseWishlist.newItem')}
                  </Button>
                }
              />
            </div>
            <div className="px-2 grid grid-cols-2 gap-2">
              <StatTile
                label={t('dashboard.stats.pending')}
                value={wishlist.data?.pending_count ?? 0}
                suffix={t('dashboard.stats.itemsSuffix')}
                loading={wishlist.isLoading}
              />
              <StatTile
                label={t('dashboard.stats.estimatedTotal')}
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
        </div>
      </div>
    </div>
  )
}
