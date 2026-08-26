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
  const isActive = habit.status === HabitStatus.ACTIVE
  const [editOpen, setEditOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const archiveHabit = useArchiveHabit({
    mutationConfig: {
      onSuccess: () => toast.add({ title: 'Habit archived', type: 'success' }),
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })
  const deleteHabit = useDeleteHabit({
    mutationConfig: {
      onSuccess: () => {
        toast.add({ title: 'Habit deleted', type: 'success' })
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
          <span className="sr-only">More options</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <PencilSimpleIcon />
            Edit
          </DropdownMenuItem>
          {isActive && (
            <DropdownMenuItem onClick={() => setArchiveOpen(true)}>
              <ArchiveIcon />
              Archive
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <TrashIcon />
            Delete
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
            <AlertDialogTitle>Archive "{habit.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This can&apos;t be undone — archived habits can&apos;t be
              reactivated yet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => archiveHabit.mutate({ id: habit.id })}
              disabled={archiveHabit.isPending}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{habit.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the habit and every entry logged for it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteHabit.mutate({ id: habit.id })}
              disabled={deleteHabit.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
