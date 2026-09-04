import { PurchaseWishlistActionsMenu } from '#/features/purchase-wishlist/components/purchase-wishlist-actions-menu'
import { PurchaseWishlistPurchasedToggle } from '#/features/purchase-wishlist/components/purchase-wishlist-purchased-toggle'
import { PurchaseWishlistWorkSelect } from '#/features/purchase-wishlist/components/purchase-wishlist-work-select'
import { formatMoney } from '#/features/purchase-wishlist/lib/currency'
import {
  formatPurchasedAt,
  purchaseWishlistIcon,
} from '#/features/purchase-wishlist/lib/format'
import type { PurchaseWishlist } from '#/types/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LinkIcon } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

export function PurchaseWishlistCard({ item }: { item: PurchaseWishlist }) {
  const { t } = useTranslation()
  const isUrl = /^https?:\/\//.test(item.store_or_url)
  const Icon = purchaseWishlistIcon(item)
  const imageUrl = item.work?.image_url ?? item.image_url

  return (
    <Card className="bg-transparent">
      <CardContent className="flex items-center gap-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="size-9 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-medium">
              {item.title ?? item.store_or_url}
            </p>
            {isUrl && item.title && (
              <a
                href={item.store_or_url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t('purchaseWishlist.openStoreLink')}
              >
                <LinkIcon className="size-3.5" />
              </a>
            )}
          </div>
          <p className="truncate text-[11px] text-muted-foreground">
            {[
              item.title ? item.store_or_url : null,
              formatPurchasedAt(item.purchased_at),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>

        <Badge variant="secondary" className="shrink-0">
          {formatMoney(item.estimated_price_in_cents, item.currency)}
        </Badge>

        <PurchaseWishlistWorkSelect item={item} />

        <PurchaseWishlistPurchasedToggle item={item} />

        <PurchaseWishlistActionsMenu item={item} />
      </CardContent>
    </Card>
  )
}
