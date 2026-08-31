import { usePurchaseWishlists } from '#/features/purchase-wishlist/api/get-purchase-wishlists'
import { PurchaseWishlistCard } from '#/features/purchase-wishlist/components/purchase-wishlist-card'
import { PurchaseWishlistFormDialog } from '#/features/purchase-wishlist/components/purchase-wishlist-form-dialog'
import { PurchaseWishlistGridCard } from '#/features/purchase-wishlist/components/purchase-wishlist-grid-card'
import {
  EmptyPurchaseWishlist,
  PurchaseWishlistListSkeleton,
} from '#/features/purchase-wishlist/components/purchase-wishlist-list-states'
import { usePurchaseWishlistDisplayPrefs } from '#/features/purchase-wishlist/lib/display-prefs'
import { VaultDisplayToggle } from '#/features/works/components/vault-display-toggle'
import { Button } from '@/components/ui/button'
import { PlusIcon } from '@phosphor-icons/react'

export function PurchaseWishlistPage() {
  const items = usePurchaseWishlists()
  const [prefs, setPrefs] = usePurchaseWishlistDisplayPrefs()

  return (
    <div className="flex h-full flex-col gap-6 px-2 py-6">
      <div className="mx-auto w-full max-w-4xl px-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-medium tracking-tight">
              Purchase Wishlist
            </h2>
            <p className="text-sm text-muted-foreground">
              Things you're planning to buy, and what you're buying them for.
            </p>
          </div>
          <PurchaseWishlistFormDialog
            trigger={
              <Button>
                <PlusIcon />
                New item
              </Button>
            }
          />
        </div>
      </div>

      {items.isLoading ? (
        <PurchaseWishlistListSkeleton />
      ) : items.data?.length === 0 ? (
        <EmptyPurchaseWishlist />
      ) : (
        <div className="flex h-full flex-col gap-4 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          <div className="mx-auto flex w-full max-w-4xl justify-end">
            <VaultDisplayToggle prefs={prefs} onChange={setPrefs} />
          </div>
          {prefs.view === 'grid' ? (
            <div
              className="mx-auto grid w-full max-w-4xl gap-4"
              style={{
                gridTemplateColumns: `repeat(${prefs.columns}, minmax(0, 1fr))`,
              }}
            >
              {items.data?.map((item) => (
                <PurchaseWishlistGridCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4">
              {items.data?.map((item) => (
                <PurchaseWishlistCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
