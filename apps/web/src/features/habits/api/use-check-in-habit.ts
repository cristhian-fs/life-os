import { useCreateEntry } from '#/features/entries/api/create-entry'
import { useEntries } from '#/features/entries/api/get-entries'
import { useUpdateEntry } from '#/features/entries/api/update-entry'
import { getHabitDetailQueryOptions } from '#/features/habits/api/get-habit'
import { todayUTC } from '#/lib/date'
import { useQueryClient } from '@tanstack/react-query'

type CheckInValue = {
  value_boolean?: boolean | null
  value_numeric?: number | null
  note?: string | null
}

/**
 * The API has no upsert/"today" endpoint and doesn't dedupe entries per day,
 * so checking in is: look up today's entry (0 or 1 rows), create if there
 * isn't one, patch if there is. List cards and the detail page share this
 * instead of each re-implementing the branch.
 */
export function useCheckInHabit(habitId: string) {
  const today = todayUTC()
  const queryClient = useQueryClient()

  const todayEntries = useEntries({
    params: { habitId, startDate: today, endDate: today },
  })
  // No unique constraint on (habit, date) server-side — last one wins, same
  // rule the report builders already use.
  const todayEntry = todayEntries.data?.at(-1) ?? null

  const invalidateReports = () => {
    // Prefix match: also catches best-streaks/calendar-map/history-bar/
    // score-history, which all nest under this same ['habits', habitId] key.
    queryClient.invalidateQueries({
      queryKey: getHabitDetailQueryOptions(habitId).queryKey,
    })
    // Separate key (['habits', 'today'], no habitId) — checking in here can
    // drop this habit off that list, so any consumer of it needs a refetch.
    queryClient.invalidateQueries({ queryKey: ['habits', 'today'] })
  }

  const createEntry = useCreateEntry({
    mutationConfig: { onSuccess: invalidateReports },
  })
  const updateEntry = useUpdateEntry({
    mutationConfig: { onSuccess: invalidateReports },
  })

  const checkIn = (value: CheckInValue) => {
    if (todayEntry) {
      updateEntry.mutate({ id: todayEntry.id, data: value })
      return
    }
    createEntry.mutate({
      data: {
        habit_id: habitId,
        date: today,
        value_boolean: null,
        value_numeric: null,
        note: null,
        ...value,
      },
    })
  }

  return {
    todayEntry,
    isLoading: todayEntries.isLoading,
    isSaving: createEntry.isPending || updateEntry.isPending,
    checkIn,
  }
}
