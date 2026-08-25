import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type {
  HabitScoreHistoryResponse,
  HabitScoreHistoryRequest,
} from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const getHabitScoreHistory = ({
  id,
  period,
}: HabitScoreHistoryRequest): Promise<HabitScoreHistoryResponse> => {
  return api.get(`/habits/${id}/score-history`, {
    params: {
      period,
    },
  })
}

export const getHabitQueryOptions = ({
  id,
  period,
}: HabitScoreHistoryRequest) => {
  return queryOptions({
    queryKey: ['habits', id],
    queryFn: () => getHabitScoreHistory({ id, period }),
  })
}

type UseHabitScoreHistoryOptions = {
  params: HabitScoreHistoryRequest
  queryConfig?: QueryConfig<typeof getHabitQueryOptions>
}

export const useHabitScoreHistory = ({
  params,
  queryConfig,
}: UseHabitScoreHistoryOptions) => {
  return useQuery({
    ...getHabitQueryOptions(params),
    ...queryConfig,
  })
}
