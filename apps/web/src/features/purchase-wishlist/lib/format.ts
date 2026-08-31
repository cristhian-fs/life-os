import { workTypeIcon } from '#/features/works/lib/format'
import type { PurchaseWishlist } from '#/types/api'
import type { Icon } from '@phosphor-icons/react'
import { ImageIcon } from '@phosphor-icons/react'

/** Falls back to the linked work's type icon, or a generic placeholder when nothing's linked. */
export function purchaseWishlistIcon(item: PurchaseWishlist): Icon {
  return item.work ? workTypeIcon[item.work.type] : ImageIcon
}

export function formatPurchasedAt(purchasedAt: string | null): string {
  if (!purchasedAt) return 'Not purchased'
  return `Purchased ${new Date(purchasedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })}`
}
