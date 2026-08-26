import { HabitFormDialog } from '#/features/habits/components/habit-form-dialog'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { ListChecksIcon, PlusIcon } from '@phosphor-icons/react'

export function EmptyHabits() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ListChecksIcon />
        </EmptyMedia>
        <EmptyTitle>No habits yet</EmptyTitle>
        <EmptyDescription>
          Add a habit to start tracking it daily, weekly, or monthly.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <HabitFormDialog
          trigger={
            <Button>
              <PlusIcon />
              New habit
            </Button>
          }
        />
      </EmptyContent>
    </Empty>
  )
}

export function HabitGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-40 rounded-lg" />
      ))}
    </div>
  )
}
