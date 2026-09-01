import { useDeleteWork } from '#/features/works/api/delete-work'
import { useFetchOgImage } from '#/features/works/api/fetch-og-image'
import { useUpdateWork } from '#/features/works/api/update-work'
import { useUploadWorkImage } from '#/features/works/api/upload-work-image'
import { fetchIsbnCover, getCoverSource } from '#/features/works/lib/cover-fetch'
import { toast } from '#/components/ui/toast'
import type { Work } from '#/types/api'
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
  DownloadSimpleIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { WorkFormDialog } from './work-form-dialog'

/** Edit/Delete for one work item — the overflow menu shared by every vault card. */
export function WorkActionsMenu({ work }: { work: Work }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteWork = useDeleteWork({
    mutationConfig: {
      onSuccess: () => toast.add({ title: 'Deleted', type: 'success' }),
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })
  const updateWork = useUpdateWork({
    mutationConfig: {
      onSuccess: () => toast.add({ title: 'Cover updated', type: 'success' }),
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })
  const uploadImage = useUploadWorkImage()
  const fetchOgImage = useFetchOgImage()

  // Dispatches to whichever source applies: ISBN for books, og:image scrape
  // for anything with a link — the same og:image path already covers a
  // future IMDb/TMDb-linked movie, no type-specific movie code needed.
  const coverSource = getCoverSource(work)
  const isFetchingCover =
    uploadImage.isPending || fetchOgImage.isPending || updateWork.isPending

  async function handleFetchCover() {
    if (!coverSource) return
    try {
      let url: string | null
      if (coverSource.kind === 'isbn') {
        const file = await fetchIsbnCover(coverSource.isbn)
        url = file ? (await uploadImage.mutateAsync({ file })).url : null
      } else {
        url = (await fetchOgImage.mutateAsync({ pageUrl: coverSource.pageUrl }))
          .url
      }

      if (!url) {
        toast.add({ title: 'No cover image found', type: 'error' })
        return
      }
      updateWork.mutate({ id: work.id, data: { image_url: url } })
    } catch (error) {
      toast.add({
        title: error instanceof Error ? error.message : 'Fetch failed',
        type: 'error',
      })
    }
  }

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
          {coverSource && (
            <DropdownMenuItem
              onClick={handleFetchCover}
              disabled={isFetchingCover}
            >
              <DownloadSimpleIcon />
              Fetch cover
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

      <WorkFormDialog
        type={work.type}
        work={work}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{work.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes it from your vault.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteWork.mutate({ id: work.id })}
              disabled={deleteWork.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
