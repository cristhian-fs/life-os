import { useLocalStorage } from '#/hooks/use-local-storage'
import type { VaultDisplayPrefs } from '#/features/works/lib/vault-display-prefs'

const DEFAULT_PREFS: VaultDisplayPrefs = { view: 'grid', columns: 3 }

/** Same grid/list + column-count prefs as the vault, one shared item type — no per-type key needed. */
export function usePurchaseWishlistDisplayPrefs() {
  return useLocalStorage('purchase-wishlist:display-prefs', DEFAULT_PREFS)
}
