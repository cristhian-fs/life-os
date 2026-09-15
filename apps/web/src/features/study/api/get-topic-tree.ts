import { api } from '#/lib/api-client'
import type { QueryConfig } from '#/lib/react-query'
import type { TopicTree } from '#/types/api'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const getTopicTree = ({
  topicId,
}: {
  topicId: string
}): Promise<TopicTree> => {
  return api.get(`/topics/${topicId}/tree`)
}

export const getTopicTreeQueryOptions = (topicId: string) => {
  return queryOptions({
    queryKey: ['topics', topicId, 'tree'],
    queryFn: () => getTopicTree({ topicId }),
  })
}

type UseTopicTreeOptions = {
  topicId: string
  queryConfig?: QueryConfig<typeof getTopicTreeQueryOptions>
}

export const useTopicTree = ({ topicId, queryConfig }: UseTopicTreeOptions) => {
  return useQuery({
    ...getTopicTreeQueryOptions(topicId),
    ...queryConfig,
  })
}
