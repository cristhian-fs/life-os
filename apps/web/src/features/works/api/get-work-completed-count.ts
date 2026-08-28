import { workAnalyticsQueryKey } from '#/features/works/api/get-works'
import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type {
  WorkCompletedCountRequest,
  WorkCompletedCountResponse,
} from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const getWorkCompletedCount = ({
  from,
  to,
  type,
}: WorkCompletedCountRequest): Promise<WorkCompletedCountResponse> => {
  return api.get('/works/analytics/completed-count', {
    params: { from: from.toISOString(), to: to.toISOString(), type },
  })
}

export const getWorkCompletedCountQueryOptions = (
  params: WorkCompletedCountRequest,
) => {
  return queryOptions({
    queryKey: [
      ...workAnalyticsQueryKey,
      'completed-count',
      params.from.toISOString(),
      params.to.toISOString(),
      params.type,
    ],
    queryFn: () => getWorkCompletedCount(params),
  })
}

type UseWorkCompletedCountOptions = {
  params: WorkCompletedCountRequest
  queryConfig?: QueryConfig<typeof getWorkCompletedCountQueryOptions>
}

export const useWorkCompletedCount = ({
  params,
  queryConfig,
}: UseWorkCompletedCountOptions) => {
  return useQuery({
    ...getWorkCompletedCountQueryOptions(params),
    ...queryConfig,
  })
}
