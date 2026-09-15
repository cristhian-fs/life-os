import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type { Topic } from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const getTopics = (): Promise<Topic[]> => {
  return api.get('/topics')
}

export const getTopicsQueryOptions = () => {
  return queryOptions({
    queryKey: ['topics'],
    queryFn: () => getTopics(),
  })
}

type UseTopicsOptions = {
  queryConfig?: QueryConfig<typeof getTopicsQueryOptions>
}

export const useTopics = ({ queryConfig }: UseTopicsOptions = {}) => {
  return useQuery({
    ...getTopicsQueryOptions(),
    ...queryConfig,
  })
}
