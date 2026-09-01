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

export function EmptyPurchaseWishlist() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ListBulletsIcon />
        </EmptyMedia>
        <EmptyTitle>Nothing on your wishlist yet</EmptyTitle>
        <EmptyDescription>
          Add something you're planning to buy.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <PurchaseWishlistFormDialog
          trigger={
            <Button>
              <PlusIcon />
              New item
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
