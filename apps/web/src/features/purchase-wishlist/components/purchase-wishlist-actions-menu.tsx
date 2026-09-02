import { useDeletePurchaseWishlist } from '#/features/purchase-wishlist/api/delete-purchase-wishlist'
import { PurchaseWishlistFormDialog } from '#/features/purchase-wishlist/components/purchase-wishlist-form-dialog'
import type { PurchaseWishlist } from '#/types/api'
import { toast } from '#/components/ui/toast'
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
  TrashIcon,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

/** Edit/Delete for one wishlist item — the overflow menu on every card. */
export function PurchaseWishlistActionsMenu({
  item,
}: {
  item: PurchaseWishlist
}) {
  const { t } = useTranslation()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteItem = useDeletePurchaseWishlist({
    mutationConfig: {
      onSuccess: () =>
        toast.add({
          title: t('purchaseWishlist.actions.deletedToast'),
          type: 'success',
        }),
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <DotsThreeOutlineIcon />
          <span className="sr-only">
            {t('purchaseWishlist.actions.moreOptions')}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <PencilSimpleIcon />
            {t('purchaseWishlist.actions.edit')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <TrashIcon />
            {t('purchaseWishlist.actions.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PurchaseWishlistFormDialog
        item={item}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('purchaseWishlist.actions.deleteConfirmTitle', {
                title: item.title ?? item.store_or_url,
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('purchaseWishlist.actions.deleteConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('purchaseWishlist.actions.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteItem.mutate({ id: item.id })}
              disabled={deleteItem.isPending}
            >
              {t('purchaseWishlist.actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
