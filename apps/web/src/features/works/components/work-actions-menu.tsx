import { useDeleteWork } from '#/features/works/api/delete-work'
import { useFetchOgImage } from '#/features/works/api/fetch-og-image'
import { useUpdateWork } from '#/features/works/api/update-work'
import { useUploadWorkImage } from '#/features/works/api/upload-work-image'
import {
  fetchIsbnCover,
  getCoverSource,
} from '#/features/works/lib/cover-fetch'
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
import { useTranslation } from 'react-i18next'
import { WorkFormDialog } from './work-form-dialog'

/** Edit/Delete for one work item — the overflow menu shared by every vault card. */
export function WorkActionsMenu({ work }: { work: Work }) {
  const { t } = useTranslation()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteWork = useDeleteWork({
    mutationConfig: {
      onSuccess: () =>
        toast.add({ title: t('work.actions.deletedToast'), type: 'success' }),
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })
  const updateWork = useUpdateWork({
    mutationConfig: {
      onSuccess: () =>
        toast.add({
          title: t('work.actions.coverUpdatedToast'),
          type: 'success',
        }),
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
        toast.add({ title: t('work.actions.noCoverFound'), type: 'error' })
        return
      }
      updateWork.mutate({ id: work.id, data: { image_url: url } })
    } catch (error) {
      toast.add({
        title:
          error instanceof Error
            ? error.message
            : t('work.actions.fetchFailed'),
        type: 'error',
      })
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <DotsThreeOutlineIcon />
          <span className="sr-only">{t('work.actions.moreOptions')}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <PencilSimpleIcon />
            {t('work.actions.edit')}
          </DropdownMenuItem>
          {coverSource && (
            <DropdownMenuItem
              onClick={handleFetchCover}
              disabled={isFetchingCover}
            >
              <DownloadSimpleIcon />
              {t('work.actions.fetchCover')}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <TrashIcon />
            {t('work.actions.delete')}
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
            <AlertDialogTitle>
              {t('work.actions.deleteConfirmTitle', { title: work.title })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('work.actions.deleteConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('work.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteWork.mutate({ id: work.id })}
              disabled={deleteWork.isPending}
            >
              {t('work.actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
