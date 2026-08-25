import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import type { Habit } from '#/types/api'
import { HabitGoalPeriod } from '#/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import z from 'zod'
import { getHabitQueryOptions } from './get-habit'

export const updateHabitInputSchema = z.object({
  name: z.string().min(1, 'Name required'),
  description: z.string().min(1, 'Description required'),
  goal_value: z.coerce.number(),
  goal_period: z.enum(HabitGoalPeriod),
})

export type UpdateHabitInput = z.infer<typeof updateHabitInputSchema>

export const updateHabit = ({
  id,
  data,
}: {
  id: string
  data: UpdateHabitInput
}): Promise<Habit> => {
  return api.patch(`/habits/${id}`, data)
}

type UseUpdateHabitOptions = {
  mutationConfig?: MutationConfig<typeof updateHabit>
}

export const useUpdateHabit = ({
  mutationConfig,
}: UseUpdateHabitOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.refetchQueries({
        queryKey: getHabitQueryOptions(data.id).queryKey,
      })
      onSuccess?.(data, ...args)
    },
    ...restConfig,
    mutationFn: updateHabit,
  })
}
