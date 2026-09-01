import { updateWorkSchema } from '#/features/works/lib/work-schema'
import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import type { Work } from '#/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type z from 'zod'
import { getWorksQueryOptions, workAnalyticsQueryKey } from './get-works'

export const updateWorkInputSchema = updateWorkSchema

export type UpdateWorkInput = z.infer<typeof updateWorkInputSchema>

export const updateWork = ({
  id,
  data,
}: {
  id: string
  data: UpdateWorkInput
}): Promise<Work> => {
  return api.patch(`/works/${id}`, data)
}

type UseUpdateWorkOptions = {
  mutationConfig?: MutationConfig<typeof updateWork>
}

export const useUpdateWork = ({
  mutationConfig,
}: UseUpdateWorkOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.refetchQueries({
        queryKey: getWorksQueryOptions().queryKey,
      })
      // status/rating/started_at/completed_at all feed the analytics charts.
      queryClient.invalidateQueries({ queryKey: workAnalyticsQueryKey })
      onSuccess?.(data, ...args)
    },
    ...restConfig,
    mutationFn: updateWork,
  })
}
