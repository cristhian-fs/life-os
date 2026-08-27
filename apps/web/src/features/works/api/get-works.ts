import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type { Work } from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

// The API has no per-type filter or single-item GET (see work.routes.ts) —
// every vault page fetches the full list and filters by `type` client-side.
export const getWorks = (): Promise<Work[]> => {
  return api.get('/works')
}

export const getWorksQueryOptions = () => {
  return queryOptions({
    queryKey: ['works'],
    queryFn: () => getWorks(),
  })
}

type UseWorksOptions = {
  queryConfig?: QueryConfig<typeof getWorksQueryOptions>
}

export const useWorks = ({ queryConfig }: UseWorksOptions = {}) => {
  return useQuery({
    ...getWorksQueryOptions(),
    ...queryConfig,
  })
}
