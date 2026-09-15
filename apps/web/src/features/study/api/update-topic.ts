import { topicFieldsSchema } from '#/features/study/lib/topic-schema'
import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import { TopicStatus } from '#/types/api'
import type { Topic } from '#/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as z from 'zod'

// Partial — the edit form sends title+description, the status popover sends
// status alone, the notes dialog sends body alone, matching the API's
// UpdateTopicSchema (all fields optional).
export const updateTopicInputSchema = topicFieldsSchema.partial().extend({
  status: z.enum(TopicStatus).optional(),
  body: z.string().nullable().optional(),
})

export type UpdateTopicInput = z.infer<typeof updateTopicInputSchema>

export const updateTopic = ({
  id,
  data,
}: {
  id: string
  data: UpdateTopicInput
}): Promise<Topic> => {
  return api.patch(`/topics/${id}`, data)
}

type UseUpdateTopicOptions = {
  mutationConfig?: MutationConfig<typeof updateTopic>
}

export const useUpdateTopic = ({
  mutationConfig,
}: UseUpdateTopicOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, ...args) => {
      // See create-topic.ts: broad invalidation because the mutation site
      // doesn't know which /study/$topicId tree (if any) is showing this topic.
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      onSuccess?.(data, ...args)
    },
    ...restConfig,
    mutationFn: updateTopic,
  })
}
