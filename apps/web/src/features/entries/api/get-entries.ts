import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type { Entry } from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export type ListEntriesParams = {
  habitId: string
  startDate: string
  endDate: string
}

export const getEntries = ({
  habitId,
  startDate,
  endDate,
}: ListEntriesParams): Promise<Entry[]> => {
  return api.get('/entries', { params: { habitId, startDate, endDate } })
}

export const getEntriesQueryOptions = (params: ListEntriesParams) => {
  return queryOptions({
    queryKey: ['entries', params.habitId, params.startDate, params.endDate],
    queryFn: () => getEntries(params),
  })
}

type UseEntriesOptions = {
  params: ListEntriesParams
  queryConfig?: QueryConfig<typeof getEntriesQueryOptions>
}

export const useEntries = ({ params, queryConfig }: UseEntriesOptions) => {
  return useQuery({
    ...getEntriesQueryOptions(params),
    ...queryConfig,
  })
}
