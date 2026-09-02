import { WorkFormDialog } from '#/features/works/components/work-form-dialog'
import { workFormNewTitle, workTypeLabel } from '#/features/works/lib/format'
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
import { useTranslation } from 'react-i18next'

export function EmptyWorks({
  type,
  icon: Icon,
}: {
  type: WorkType
  icon: Icon
}) {
  const { t } = useTranslation()
  const label = workTypeLabel(type).toLowerCase()

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{t('work.emptyState.title', { label })}</EmptyTitle>
        <EmptyDescription>{t('work.emptyState.description')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <WorkFormDialog
          type={type}
          trigger={
            <Button>
              <PlusIcon />
              {workFormNewTitle(type)}
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
