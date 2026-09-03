import { useHabits } from '#/features/habits/api/get-habits'
import { HabitCard } from '#/features/habits/components/habit-card'
import { HabitFormDialog } from '#/features/habits/components/habit-form-dialog'
import {
  EmptyHabits,
  HabitGridSkeleton,
} from '#/features/habits/components/habit-list-states'
import { HabitStatus } from '#/types/api'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlusIcon } from '@phosphor-icons/react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/dashboard/habits/')({
  component: RouteComponent,
})

function RouteComponent() {
  const habits = useHabits({})
  const { t } = useTranslation('translations')
  const active =
    habits.data?.filter((h) => h.status === HabitStatus.ACTIVE) ?? []
  const archived =
    habits.data?.filter((h) => h.status === HabitStatus.ARCHIVED) ?? []

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
        <Tabs defaultValue="active" className="flex-1">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="active">
                {t('habits.status.active')}
              </TabsTrigger>
              <TabsTrigger value="archived">
                {t('habits.status.archived')}
              </TabsTrigger>
            </TabsList>
            <HabitFormDialog
              trigger={
                <Button>
                  <PlusIcon />
                  {t('habits.form.newTitle')}
                </Button>
              }
            />
          </div>

          <TabsContent value="active" className="mx-auto w-full max-w-4xl">
            {habits.isLoading ? (
              <HabitGridSkeleton />
            ) : active.length === 0 ? (
              <EmptyHabits />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {active.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="mx-auto w-full max-w-4xl">
            {habits.isLoading ? (
              <HabitGridSkeleton />
            ) : archived.length === 0 ? (
              <p className="py-12 text-center text-xs text-muted-foreground">
                {t('habits.emptyState.noArchivedHabits')}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {archived.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
