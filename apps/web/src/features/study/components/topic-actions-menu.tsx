import { useDeleteTopic } from '#/features/study/api/delete-topic'
import { toast } from '#/components/ui/toast'
import type { Topic } from '#/types/api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  DotsThreeOutlineIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TopicFormDialog } from './topic-form-dialog'

/** Edit/Add subtopic/Delete for one topic — shared by the tree table rows and the detail page header. */
export function TopicActionsMenu({
  topic,
  onDeleted,
}: {
  topic: Topic
  /** Detail page navigates away after deleting the root topic; rows just let the tree re-render. */
  onDeleted?: () => void
}) {
  const { t } = useTranslation()
  const [editOpen, setEditOpen] = useState(false)
  const [addSubOpen, setAddSubOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteTopic = useDeleteTopic({
    mutationConfig: {
      onSuccess: () => {
        toast.add({ title: t('study.actions.deletedToast'), type: 'success' })
        onDeleted?.()
      },
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <DotsThreeOutlineIcon />
          <span className="sr-only">{t('study.actions.moreOptions')}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setAddSubOpen(true)}>
            <PlusIcon />
            {t('study.actions.addSubtopic')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <PencilSimpleIcon />
            {t('study.actions.edit')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <TrashIcon />
            {t('study.actions.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TopicFormDialog
        topic={topic}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <TopicFormDialog
        parentTopicId={topic.id}
        open={addSubOpen}
        onOpenChange={setAddSubOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('study.actions.deleteConfirmTitle', { title: topic.title })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('study.actions.deleteConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('study.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteTopic.mutate({ id: topic.id })}
              disabled={deleteTopic.isPending}
            >
              {t('study.actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
