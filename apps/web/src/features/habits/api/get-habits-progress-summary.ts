import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type { HabitProgressSummaryResponse } from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const getHabitsProgressSummary =
  (): Promise<HabitProgressSummaryResponse> => {
    return api.get('/habits/progress-summary')
  }

export const getHabitsProgressSummaryQueryOptions = () => {
  return queryOptions({
    queryKey: ['habits', 'progress-summary'],
    queryFn: () => getHabitsProgressSummary(),
  })
}

type UseHabitsProgressSummaryOptions = {
  queryConfig?: QueryConfig<typeof getHabitsProgressSummaryQueryOptions>
}

export const useHabitsProgressSummary = ({
  queryConfig,
}: UseHabitsProgressSummaryOptions = {}) => {
  return useQuery({
    ...getHabitsProgressSummaryQueryOptions(),
    ...queryConfig,
  })
}
