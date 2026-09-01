import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type { PendingWishlistSummaryResponse } from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const getPendingWishlistSummary =
  (): Promise<PendingWishlistSummaryResponse> => {
    return api.get('/purchase-wishlist/summary')
  }

export const getPendingWishlistSummaryQueryOptions = () => {
  return queryOptions({
    queryKey: ['purchase-wishlist', 'summary'],
    queryFn: () => getPendingWishlistSummary(),
  })
}

type UsePendingWishlistSummaryOptions = {
  queryConfig?: QueryConfig<typeof getPendingWishlistSummaryQueryOptions>
}

export const usePendingWishlistSummary = ({
  queryConfig,
}: UsePendingWishlistSummaryOptions = {}) => {
  return useQuery({
    ...getPendingWishlistSummaryQueryOptions(),
    ...queryConfig,
  })
}
