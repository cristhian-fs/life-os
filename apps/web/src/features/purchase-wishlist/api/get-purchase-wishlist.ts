import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type { PurchaseWishlist } from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const getPurchaseWishlist = ({
  id,
}: {
  id: string
}): Promise<PurchaseWishlist> => {
  return api.get(`/purchase-wishlist/${id}`)
}

export const getPurchaseWishlistQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ['purchase-wishlist', id],
    queryFn: () => getPurchaseWishlist({ id }),
  })
}

type UsePurchaseWishlistOptions = {
  id: string
  queryConfig?: QueryConfig<typeof getPurchaseWishlistQueryOptions>
}

export const usePurchaseWishlist = ({
  id,
  queryConfig,
}: UsePurchaseWishlistOptions) => {
  return useQuery({
    ...getPurchaseWishlistQueryOptions(id),
    ...queryConfig,
  })
}
