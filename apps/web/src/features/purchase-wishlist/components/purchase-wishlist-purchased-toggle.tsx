import { useUpdatePurchaseWishlist } from '#/features/purchase-wishlist/api/update-purchase-wishlist'
import type { PurchaseWishlist } from '#/types/api'
import { toast } from '#/components/ui/toast'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/** Quick purchased/not-purchased toggle for a wishlist card — sets or clears purchased_at. */
export function PurchaseWishlistPurchasedToggle({
  item,
}: {
  item: PurchaseWishlist
}) {
  const updateItem = useUpdatePurchaseWishlist({
    mutationConfig: {
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })

  const purchased = !!item.purchased_at

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Switch
            checked={purchased}
            onCheckedChange={(checked) =>
              updateItem.mutate({
                id: item.id,
                data: {
                  purchased_at: checked ? new Date().toISOString() : null,
                },
              })
            }
            disabled={updateItem.isPending}
            aria-label={
              purchased ? 'Mark as not purchased' : 'Mark as purchased'
            }
          />
        }
      />
      <TooltipContent>
        {purchased ? 'Mark as not purchased' : 'Mark as purchased'}
      </TooltipContent>
    </Tooltip>
  )
}
