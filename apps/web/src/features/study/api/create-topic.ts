import { api } from '#/lib/api-client'
import type { topicFieldsSchema } from '#/features/study/lib/topic-schema'
import type { MutationConfig } from '#/lib/react-query'
import type { Topic } from '#/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type z from 'zod'

export type CreateTopicInput = z.infer<typeof topicFieldsSchema> & {
  parent_topic_id: string | null
}

export const createTopic = ({
  data,
}: {
  data: CreateTopicInput
}): Promise<Topic> => {
  // order_index/work_id/body are required keys in the API's CreateTopicSchema
  // (nullable, but not optional) even though this form never sets them.
  return api.post('/topics', {
    ...data,
    body: null,
    order_index: null,
    work_id: null,
  })
}

type UseCreateTopicOptions = {
  mutationConfig?: MutationConfig<typeof createTopic>
}

export const useCreateTopic = ({
  mutationConfig,
}: UseCreateTopicOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, ...args) => {
      // Broad invalidation, not a targeted queryKey: a new topic can land
      // anywhere in an existing tree (any ancestor could be the page's
      // root), and this hook only knows the parent, not which /study/$topicId
      // page (if any) is showing it.
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      onSuccess?.(data, ...args)
    },
    ...restConfig,
    mutationFn: createTopic,
  })
}
