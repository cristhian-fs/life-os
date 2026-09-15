import { useTopicTree } from '#/features/study/api/get-topic-tree'
import { TopicActionsMenu } from '#/features/study/components/topic-actions-menu'
import { TopicNotesDialog } from '#/features/study/components/topic-notes-dialog'
import { TopicStatusPopover } from '#/features/study/components/topic-status-popover'
import { TopicTreeTable } from '#/features/study/components/topic-tree-table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { NotePencilIcon } from '@phosphor-icons/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/dashboard/study/$topicId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { topicId } = Route.useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const tree = useTopicTree({ topicId })

  if (tree.isLoading || !tree.data) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const root = tree.data

  return (
    <div className="flex flex-col gap-6 p-2 py-8">
      <div className="mx-auto flex w-full max-w-4xl items-start justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium">{root.title}</h2>
          {root.description && (
            <p className="text-xs text-muted-foreground">{root.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <TopicStatusPopover topic={root} />
          <TopicNotesDialog
            topic={root}
            trigger={
              <Button variant="ghost" size="icon-sm">
                <NotePencilIcon weight={root.body ? 'fill' : 'regular'} />
                <span className="sr-only">{t('study.notes.button')}</span>
              </Button>
            }
          />
          <TopicActionsMenu
            topic={root}
            onDeleted={() => navigate({ to: '/dashboard/study' })}
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl rounded-xl bg-card ring-1 ring-foreground/10">
        <TopicTreeTable tree={root} />
      </div>
    </div>
  )
}
