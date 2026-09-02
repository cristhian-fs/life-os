import { useArchiveHabit } from '#/features/habits/api/archive-habit'
import { useDeleteHabit } from '#/features/habits/api/delete-habit'
import { toast } from '#/components/ui/toast'
import { HabitStatus } from '#/types/api'
import type { Habit } from '#/types/api'
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
  ArchiveIcon,
  DotsThreeOutlineIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HabitFormDialog } from './habit-form-dialog'

/** Edit/Archive/Delete for one habit — the overflow menu shared by the card and the detail page. */
export function HabitActionsMenu({
  habit,
  onDeleted,
}: {
  habit: Habit
  /** Detail page navigates away after a delete; the card just lets the list re-render. */
  onDeleted?: () => void
}) {
  const { t } = useTranslation()
  const isActive = habit.status === HabitStatus.ACTIVE
  const [editOpen, setEditOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const archiveHabit = useArchiveHabit({
    mutationConfig: {
      onSuccess: () =>
        toast.add({
          title: t('habits.actions.archivedToast'),
          type: 'success',
        }),
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })
  const deleteHabit = useDeleteHabit({
    mutationConfig: {
      onSuccess: () => {
        toast.add({ title: t('habits.actions.deletedToast'), type: 'success' })
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
          <span className="sr-only">{t('habits.actions.moreOptions')}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <PencilSimpleIcon />
            {t('habits.actions.edit')}
          </DropdownMenuItem>
          {isActive && (
            <DropdownMenuItem onClick={() => setArchiveOpen(true)}>
              <ArchiveIcon />
              {t('habits.actions.archive')}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <TrashIcon />
            {t('habits.actions.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <HabitFormDialog
        habit={habit}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('habits.actions.archiveConfirmTitle', { name: habit.name })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('habits.actions.archiveConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('habits.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => archiveHabit.mutate({ id: habit.id })}
              disabled={archiveHabit.isPending}
            >
              {t('habits.actions.archive')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('habits.actions.deleteConfirmTitle', { name: habit.name })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('habits.actions.deleteConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('habits.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteHabit.mutate({ id: habit.id })}
              disabled={deleteHabit.isPending}
            >
              {t('habits.actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
