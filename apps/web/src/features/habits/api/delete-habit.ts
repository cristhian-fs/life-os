import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import type { Habit } from '#/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getHabitQueryOptions } from './get-habit'

export const deleteHabit = ({ id }: { id: string }): Promise<Habit> => {
  return api.patch(`/habits/${id}/delete`)
}

type UseDeleteHabitOptions = {
  mutationConfig?: MutationConfig<typeof deleteHabit>
}

export const useDeleteHabit = ({
  mutationConfig,
}: UseDeleteHabitOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getHabitQueryOptions(data.id).queryKey,
      })
      onSuccess?.(data, ...args)
    },
    ...restConfig,
    mutationFn: deleteHabit,
  })
}
