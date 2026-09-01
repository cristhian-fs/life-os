import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type { Work } from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

// Shared prefix for every works/analytics/* query — create/update/delete-work
// invalidate by this (not the full key, which also carries from/to/bucketUnit/
// type) so any open chart refetches regardless of its specific range.
export const workAnalyticsQueryKey = ['works', 'analytics'] as const

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
