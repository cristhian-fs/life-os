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

export const Route = createFileRoute('/dashboard/habits/')({
  component: RouteComponent,
})

function RouteComponent() {
  const habits = useHabits({})
  const active =
    habits.data?.filter((h) => h.status === HabitStatus.ACTIVE) ?? []
  const archived =
    habits.data?.filter((h) => h.status === HabitStatus.ARCHIVED) ?? []

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <Tabs defaultValue="active" className="flex-1">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
            <HabitFormDialog
              trigger={
                <Button>
                  <PlusIcon />
                  New habit
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
              <div className="grid grid-cols-1 gap-4">
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
                No archived habits.
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
