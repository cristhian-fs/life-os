import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type { PurchaseWishlist } from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const purchaseWishlistQueryKey = ['purchase-wishlist'] as const

export const getPurchaseWishlists = (): Promise<PurchaseWishlist[]> => {
  return api.get('/purchase-wishlist')
}

export const getPurchaseWishlistsQueryOptions = () => {
  return queryOptions({
    queryKey: purchaseWishlistQueryKey,
    queryFn: () => getPurchaseWishlists(),
  })
}

type UsePurchaseWishlistsOptions = {
  queryConfig?: QueryConfig<typeof getPurchaseWishlistsQueryOptions>
}

export const usePurchaseWishlists = ({
  queryConfig,
}: UsePurchaseWishlistsOptions = {}) => {
  return useQuery({
    ...getPurchaseWishlistsQueryOptions(),
    ...queryConfig,
  })
}
