import { WorkFormDialog } from '#/features/works/components/work-form-dialog'
import { workTypeLabel } from '#/features/works/lib/format'
import type { WorkType } from '#/types/api'
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
import type { Icon } from '@phosphor-icons/react'
import { PlusIcon } from '@phosphor-icons/react'

export function EmptyWorks({
  type,
  icon: Icon,
}: {
  type: WorkType
  icon: Icon
}) {
  const label = workTypeLabel[type].toLowerCase()

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>No {label}s yet</EmptyTitle>
        <EmptyDescription>Add one to start tracking it here.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <WorkFormDialog
          type={type}
          trigger={
            <Button>
              <PlusIcon />
              New {label}
            </Button>
          }
        />
      </EmptyContent>
    </Empty>
  )
}

export function WorkListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  )
}
