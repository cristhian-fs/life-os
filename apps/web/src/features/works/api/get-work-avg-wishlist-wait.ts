import { workAnalyticsQueryKey } from '#/features/works/api/get-works'
import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type {
  WorkAvgWishlistWaitRequest,
  WorkAvgWishlistWaitResponse,
} from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const getWorkAvgWishlistWait = ({
  from,
  to,
  type,
}: WorkAvgWishlistWaitRequest): Promise<WorkAvgWishlistWaitResponse> => {
  return api.get('/works/analytics/avg-wishlist-wait', {
    params: { from: from.toISOString(), to: to.toISOString(), type },
  })
}

export const getWorkAvgWishlistWaitQueryOptions = (
  params: WorkAvgWishlistWaitRequest,
) => {
  return queryOptions({
    queryKey: [
      ...workAnalyticsQueryKey,
      'avg-wishlist-wait',
      params.from.toISOString(),
      params.to.toISOString(),
      params.type,
    ],
    queryFn: () => getWorkAvgWishlistWait(params),
  })
}

type UseWorkAvgWishlistWaitOptions = {
  params: WorkAvgWishlistWaitRequest
  queryConfig?: QueryConfig<typeof getWorkAvgWishlistWaitQueryOptions>
}

export const useWorkAvgWishlistWait = ({
  params,
  queryConfig,
}: UseWorkAvgWishlistWaitOptions) => {
  return useQuery({
    ...getWorkAvgWishlistWaitQueryOptions(params),
    ...queryConfig,
  })
}
