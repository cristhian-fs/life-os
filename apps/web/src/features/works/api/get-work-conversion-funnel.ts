import { workAnalyticsQueryKey } from '#/features/works/api/get-works'
import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type {
  WorkConversionFunnelRequest,
  WorkConversionFunnelResponse,
} from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const getWorkConversionFunnel = ({
  from,
  to,
}: WorkConversionFunnelRequest): Promise<WorkConversionFunnelResponse> => {
  return api.get('/works/analytics/status-funnel', {
    params: { from: from.toISOString(), to: to.toISOString() },
  })
}

export const getWorkConversionFunnelQueryOptions = (
  params: WorkConversionFunnelRequest,
) => {
  return queryOptions({
    queryKey: [
      ...workAnalyticsQueryKey,
      'status-funnel',
      params.from.toISOString(),
      params.to.toISOString(),
    ],
    queryFn: () => getWorkConversionFunnel(params),
  })
}

type UseWorkConversionFunnelOptions = {
  params: WorkConversionFunnelRequest
  queryConfig?: QueryConfig<typeof getWorkConversionFunnelQueryOptions>
}

export const useWorkConversionFunnel = ({
  params,
  queryConfig,
}: UseWorkConversionFunnelOptions) => {
  return useQuery({
    ...getWorkConversionFunnelQueryOptions(params),
    ...queryConfig,
  })
}
