import { PurchaseWishlistFormDialog } from '#/features/purchase-wishlist/components/purchase-wishlist-form-dialog'
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
import { ListBulletsIcon, PlusIcon } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

export function EmptyPurchaseWishlist() {
  const { t } = useTranslation()

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ListBulletsIcon />
        </EmptyMedia>
        <EmptyTitle>{t('purchaseWishlist.emptyState.title')}</EmptyTitle>
        <EmptyDescription>
          {t('purchaseWishlist.emptyState.description')}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <PurchaseWishlistFormDialog
          trigger={
            <Button>
              <PlusIcon />
              {t('purchaseWishlist.newItem')}
            </Button>
          }
        />
      </EmptyContent>
    </Empty>
  )
}

export function PurchaseWishlistListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  )
}
