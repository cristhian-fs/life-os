import { createWorkSchema } from '#/features/works/lib/work-schema'
import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import type { Work } from '#/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type z from 'zod'
import { getWorksQueryOptions } from './get-works'

export const createWorkInputSchema = createWorkSchema

export type CreateWorkInput = z.infer<typeof createWorkInputSchema>

export const createWork = ({
  data,
}: {
  data: CreateWorkInput
}): Promise<Work> => {
  return api.post(`/works`, data)
}

type UseCreateWorkOptions = {
  mutationConfig?: MutationConfig<typeof createWork>
}

export const useCreateWork = ({
  mutationConfig,
}: UseCreateWorkOptions = {}) => {
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
    mutationFn: createWork,
  })
}
