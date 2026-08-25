import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import type { Habit } from '#/types/api'
import { HabitGoalPeriod, HabitType } from '#/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import z from 'zod'
import { getHabitsQueryOptions } from './get-habits'

export const createHabitInputSchema = z.object({
  name: z.string().min(1, 'Name required'),
  description: z.string().min(1, 'Description required'),
  goal_value: z.coerce.number(),
  goal_period: z.enum(HabitGoalPeriod),
  type: z.enum(HabitType),
  unit: z.string().min(1, 'Unit required'),
})

export type CreateHabitInput = z.infer<typeof createHabitInputSchema>

export const createHabit = ({
  data,
}: {
  data: CreateHabitInput
}): Promise<Habit> => {
  return api.post(`/habits`, data)
}

type UseCreateHabitOptions = {
  mutationConfig?: MutationConfig<typeof createHabit>
}

export const useCreateHabit = ({
  mutationConfig,
}: UseCreateHabitOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.refetchQueries({
        queryKey: getHabitsQueryOptions().queryKey,
      })
      onSuccess?.(data, ...args)
    },
    ...restConfig,
    mutationFn: createHabit,
  })
}
