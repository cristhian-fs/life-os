import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type { MonthlyPurchaseCountsResponse } from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const getPurchaseWishlistMonthlyCounts = (
  year: number,
): Promise<MonthlyPurchaseCountsResponse> => {
  return api.get('/purchase-wishlist/monthly-counts', { params: { year } })
}

export const getPurchaseWishlistMonthlyCountsQueryOptions = (year: number) => {
  return queryOptions({
    queryKey: ['purchase-wishlist', 'monthly-counts', year],
    queryFn: () => getPurchaseWishlistMonthlyCounts(year),
  })
}

type UsePurchaseWishlistMonthlyCountsOptions = {
  year: number
  queryConfig?: QueryConfig<typeof getPurchaseWishlistMonthlyCountsQueryOptions>
}

export const usePurchaseWishlistMonthlyCounts = ({
  year,
  queryConfig,
}: UsePurchaseWishlistMonthlyCountsOptions) => {
  return useQuery({
    ...getPurchaseWishlistMonthlyCountsQueryOptions(year),
    ...queryConfig,
  })
}
