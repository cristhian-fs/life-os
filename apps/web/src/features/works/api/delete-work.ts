import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import type { DeleteWorkResponse } from '#/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getWorksQueryOptions } from './get-works'

export const deleteWork = ({
  id,
}: {
  id: string
}): Promise<DeleteWorkResponse> => {
  return api.delete(`/works/${id}`)
}

type UseDeleteWorkOptions = {
  mutationConfig?: MutationConfig<typeof deleteWork>
}

export const useDeleteWork = ({
  mutationConfig,
}: UseDeleteWorkOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.refetchQueries({
        queryKey: getWorksQueryOptions().queryKey,
      })
      onSuccess?.(data, ...args)
    },
    ...restConfig,
    mutationFn: deleteWork,
  })
}
