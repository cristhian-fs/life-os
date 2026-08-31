import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type { HabitsTodayResponse } from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const getHabitsToday = (): Promise<HabitsTodayResponse> => {
  return api.get('/habits/today')
}

export const getHabitsTodayQueryOptions = () => {
  return queryOptions({
    queryKey: ['habits', 'today'],
    queryFn: () => getHabitsToday(),
  })
}

type UseHabitsTodayOptions = {
  queryConfig?: QueryConfig<typeof getHabitsTodayQueryOptions>
}

export const useHabitsToday = ({
  queryConfig,
}: UseHabitsTodayOptions = {}) => {
  return useQuery({
    ...getHabitsTodayQueryOptions(),
    ...queryConfig,
  })
}
