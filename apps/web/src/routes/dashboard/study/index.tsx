import { useTopics } from '#/features/study/api/get-topics'
import { TopicActionsMenu } from '#/features/study/components/topic-actions-menu'
import {
  EmptyTopics,
  TopicListSkeleton,
} from '#/features/study/components/topic-list-states'
import { TopicFormDialog } from '#/features/study/components/topic-form-dialog'
import { TopicNotesDialog } from '#/features/study/components/topic-notes-dialog'
import { TopicStatusPopover } from '#/features/study/components/topic-status-popover'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { NotePencilIcon, PlusIcon } from '@phosphor-icons/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/dashboard/study/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const topics = useTopics({})

  const roots = (topics.data ?? [])
    .filter((topic) => topic.parent_topic_id === null)
    .sort((a, b) => {
      const orderDiff =
        (a.order_index ?? Infinity) - (b.order_index ?? Infinity)
      return orderDiff !== 0 ? orderDiff : a.title.localeCompare(b.title)
    })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium">{t('study.title')}</h2>
          <p className="text-xs text-muted-foreground">
            {t('study.description')}
          </p>
        </div>
        <TopicFormDialog
          trigger={
            <Button>
              <PlusIcon />
              {t('study.newTopic')}
            </Button>
          }
        />
      </div>

      <div className="mx-auto w-full max-w-4xl">
        {topics.isLoading ? (
          <TopicListSkeleton />
        ) : roots.length === 0 ? (
          <EmptyTopics />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('study.tree.title')}</TableHead>
                <TableHead>{t('study.tree.status')}</TableHead>
                <TableHead className="w-10" />
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {roots.map((topic) => (
                <TableRow key={topic.id}>
                  <TableCell>
                    <Link
                      to="/dashboard/study/$topicId"
                      params={{ topicId: topic.id }}
                      className="hover:underline"
                    >
                      {topic.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <TopicStatusPopover topic={topic} />
                  </TableCell>
                  <TableCell>
                    <TopicNotesDialog
                      topic={topic}
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <NotePencilIcon
                            weight={topic.body ? 'fill' : 'regular'}
                          />
                          <span className="sr-only">
                            {t('study.notes.button')}
                          </span>
                        </Button>
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TopicActionsMenu topic={topic} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
