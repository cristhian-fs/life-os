import { TopicFormDialog } from '#/features/study/components/topic-form-dialog'
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
import { BookOpenIcon, PlusIcon } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

export function EmptyTopics() {
  const { t } = useTranslation()

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookOpenIcon />
        </EmptyMedia>
        <EmptyTitle>{t('study.emptyState.title')}</EmptyTitle>
        <EmptyDescription>{t('study.emptyState.description')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <TopicFormDialog
          trigger={
            <Button>
              <PlusIcon />
              {t('study.emptyState.newTopic')}
            </Button>
          }
        />
      </EmptyContent>
    </Empty>
  )
}

export function TopicListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  )
}
