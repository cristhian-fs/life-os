import { PurchaseWishlistActionsMenu } from '#/features/purchase-wishlist/components/purchase-wishlist-actions-menu'
import { PurchaseWishlistPurchasedToggle } from '#/features/purchase-wishlist/components/purchase-wishlist-purchased-toggle'
import { PurchaseWishlistWorkSelect } from '#/features/purchase-wishlist/components/purchase-wishlist-work-select'
import { formatMoney } from '#/features/purchase-wishlist/lib/currency'
import {
  formatPurchasedAt,
  purchaseWishlistIcon,
} from '#/features/purchase-wishlist/lib/format'
import type { PurchaseWishlist } from '#/types/api'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

/** Poster-style card for grid view — vertical, cover art up top. */
export function PurchaseWishlistGridCard({ item }: { item: PurchaseWishlist }) {
  // Subscribes to language changes so formatPurchasedAt()/formatMoney()
  // (which read the global i18n singleton, not this hook) re-render on switch.
  useTranslation()
  const Icon = purchaseWishlistIcon(item)

  return (
    <Card className="gap-0 overflow-hidden bg-transparent p-0">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {item.work?.image_url ? (
          <img
            src={item.work.image_url}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <Icon className="size-8" />
          </div>
        )}
        <div className="absolute top-1.5 right-1.5 rounded-md bg-background/80 backdrop-blur-xs">
          <PurchaseWishlistActionsMenu item={item} />
        </div>
        <Badge
          variant="secondary"
          className="absolute bottom-1.5 left-1.5 bg-background/80 backdrop-blur-xs"
        >
          {formatMoney(item.estimated_price_in_cents, item.currency)}
        </Badge>
      </div>
      <CardContent className="flex flex-col gap-1.5 p-3">
        <p className="truncate text-sm font-medium">
          {item.title ?? item.store_or_url}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {formatPurchasedAt(item.purchased_at)}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <PurchaseWishlistWorkSelect item={item} />
          <PurchaseWishlistPurchasedToggle item={item} />
        </div>
      </CardContent>
    </Card>
  )
}
