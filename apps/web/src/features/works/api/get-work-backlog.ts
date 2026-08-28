import { workAnalyticsQueryKey } from '#/features/works/api/get-works'
import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type {
  WorkAnalyticsBacklogRequest,
  WorkAnalyticsBacklogResponse,
} from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const getWorkBacklog = ({
  from,
  to,
  bucketUnit,
}: WorkAnalyticsBacklogRequest): Promise<WorkAnalyticsBacklogResponse> => {
  return api.get('/works/analytics/backlog', {
    params: { from: from.toISOString(), to: to.toISOString(), bucketUnit },
  })
}

export const getWorkBacklogQueryOptions = (
  params: WorkAnalyticsBacklogRequest,
) => {
  return queryOptions({
    queryKey: [
      ...workAnalyticsQueryKey,
      'backlog',
      params.from.toISOString(),
      params.to.toISOString(),
      params.bucketUnit,
    ],
    queryFn: () => getWorkBacklog(params),
  })
}

type UseWorkBacklogOptions = {
  params: WorkAnalyticsBacklogRequest
  queryConfig?: QueryConfig<typeof getWorkBacklogQueryOptions>
}

export const useWorkBacklog = ({
  params,
  queryConfig,
}: UseWorkBacklogOptions) => {
  return useQuery({
    ...getWorkBacklogQueryOptions(params),
    ...queryConfig,
  })
}
