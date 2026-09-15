import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import type { DeleteTopicResponse } from '#/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const deleteTopic = ({
  id,
}: {
  id: string
}): Promise<DeleteTopicResponse> => {
  return api.delete(`/topics/${id}`)
}

type UseDeleteTopicOptions = {
  mutationConfig?: MutationConfig<typeof deleteTopic>
}

export const useDeleteTopic = ({
  mutationConfig,
}: UseDeleteTopicOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      onSuccess?.(data, ...args)
    },
    ...restConfig,
    mutationFn: deleteTopic,
  })
}
