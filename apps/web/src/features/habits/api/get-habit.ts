import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type { Habit } from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const getHabit = ({ habitId }: { habitId: string }): Promise<Habit> => {
  return api.get(`/habits/${habitId}`)
}

export const getHabitDetailQueryOptions = (habitId: string) => {
  return queryOptions({
    queryKey: ['habits', habitId],
    queryFn: () => getHabit({ habitId }),
  })
}

type UseHabitOptions = {
  habitId: string
  queryConfig?: QueryConfig<typeof getHabitDetailQueryOptions>
}

export const useHabit = ({ habitId, queryConfig }: UseHabitOptions) => {
  return useQuery({
    ...getHabitDetailQueryOptions(habitId),
    ...queryConfig,
  })
}
