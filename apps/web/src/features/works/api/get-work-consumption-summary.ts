import { workAnalyticsQueryKey } from '#/features/works/api/get-works'
import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type { WorkConsumptionSummaryResponse } from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const getWorkConsumptionSummary =
  (): Promise<WorkConsumptionSummaryResponse> => {
    return api.get('/works/analytics/summary')
  }

export const getWorkConsumptionSummaryQueryOptions = () => {
  return queryOptions({
    queryKey: [...workAnalyticsQueryKey, 'summary'],
    queryFn: () => getWorkConsumptionSummary(),
  })
}

type UseWorkConsumptionSummaryOptions = {
  queryConfig?: QueryConfig<typeof getWorkConsumptionSummaryQueryOptions>
}

export const useWorkConsumptionSummary = ({
  queryConfig,
}: UseWorkConsumptionSummaryOptions = {}) => {
  return useQuery({
    ...getWorkConsumptionSummaryQueryOptions(),
    ...queryConfig,
  })
}
