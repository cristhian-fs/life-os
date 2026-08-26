import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type { HabitBestStreaksResponse } from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const getHabitBestStreaks = ({
  habitId,
}: {
  habitId: string
}): Promise<HabitBestStreaksResponse> => {
  return api.get(`/habits/${habitId}/best-streaks`)
}

export const getHabitBestStreaksQueryOptions = (habitId: string) => {
  return queryOptions({
    queryKey: ['habits', habitId, 'best-streaks'],
    queryFn: () => getHabitBestStreaks({ habitId }),
  })
}

type UseHabitBestStreaksOptions = {
  habitId: string
  queryConfig?: QueryConfig<typeof getHabitBestStreaksQueryOptions>
}

export const useHabitBestStreaks = ({
  habitId,
  queryConfig,
}: UseHabitBestStreaksOptions) => {
  return useQuery({
    ...getHabitBestStreaksQueryOptions(habitId),
    ...queryConfig,
  })
}
