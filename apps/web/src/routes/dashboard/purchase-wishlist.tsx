import { PurchaseWishlistPage } from '#/features/purchase-wishlist/components/purchase-wishlist-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/purchase-wishlist')({
  component: PurchaseWishlistPage,
})
