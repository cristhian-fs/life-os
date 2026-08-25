import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type {
  HabitHistoryBarGraphRequest,
  HabitHistoryBarGraphResponse,
} from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const getHabitHistoryBar = ({
  id,
  period,
}: HabitHistoryBarGraphRequest): Promise<HabitHistoryBarGraphResponse> => {
  return api.get(`/habits/${id}/history-bar`, {
    params: {
      period,
    },
  })
}

export const getHabitQueryOptions = ({
  id,
  period,
}: HabitHistoryBarGraphRequest) => {
  return queryOptions({
    queryKey: ['habits', id],
    queryFn: () => getHabitHistoryBar({ id, period }),
  })
}

type UseHabitHistoryBarOptions = {
  params: HabitHistoryBarGraphRequest
  queryConfig?: QueryConfig<typeof getHabitQueryOptions>
}

export const useHabitHistoryBar = ({
  params,
  queryConfig,
}: UseHabitHistoryBarOptions) => {
  return useQuery({
    ...getHabitQueryOptions(params),
    ...queryConfig,
  })
}
