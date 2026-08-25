import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type { Habit } from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const getHabits = (): Promise<Habit[]> => {
  return api.get('/habits')
}

export const getHabitsQueryOptions = () => {
  return queryOptions({
    queryKey: ['habits'],
    queryFn: () => getHabits(),
  })
}

type UseHabitsOptions = {
  queryConfig?: QueryConfig<typeof getHabitsQueryOptions>
}

export const useHabits = ({ queryConfig }: UseHabitsOptions) => {
  return useQuery({
    ...getHabitsQueryOptions(),
    ...queryConfig,
  })
}
