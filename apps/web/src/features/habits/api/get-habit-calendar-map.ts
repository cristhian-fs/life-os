import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type { HabitCalendarMapResponse } from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const getHabitCalendarMap = ({
  habitId,
}: {
  habitId: string
}): Promise<HabitCalendarMapResponse> => {
  return api.get(`/habits/${habitId}/calendar-map`)
}

export const getHabitCalendarMapQueryOptions = (habitId: string) => {
  return queryOptions({
    queryKey: ['habits', habitId, 'calendar-map'],
    queryFn: () => getHabitCalendarMap({ habitId }),
  })
}

type UseHabitCalendarMapOptions = {
  habitId: string
  queryConfig?: QueryConfig<typeof getHabitCalendarMapQueryOptions>
}

export const useHabitCalendarMap = ({
  habitId,
  queryConfig,
}: UseHabitCalendarMapOptions) => {
  return useQuery({
    ...getHabitCalendarMapQueryOptions(habitId),
    ...queryConfig,
  })
}
