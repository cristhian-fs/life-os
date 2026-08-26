import type { useCheckInHabit } from '#/features/habits/api/use-check-in-habit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useState } from 'react'

type NumericCheckInProps = {
  habit: { name: string; unit: string | null; goal_value: number | null }
  checkIn: ReturnType<typeof useCheckInHabit>
  // 'compact' (habit card): value/goal on one line, no label.
  // 'row' (detail page): a "Today" label, narrower input.
  variant?: 'compact' | 'row'
}

/** Today's value + a small form to log a new one — shared by the habit card and detail page. */
export function NumericCheckIn({
  habit,
  checkIn,
  variant = 'compact',
}: NumericCheckInProps) {
  const value = checkIn.todayEntry?.value_numeric ?? 0
  const goal = habit.goal_value ?? 0
  const [draft, setDraft] = useState('')

  const commit = () => {
    const next = draft === '' ? null : Number(draft)
    if (next === null || Number.isNaN(next)) return
    checkIn.checkIn({ value_numeric: next })
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-2">
      {variant === 'row' ? (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Today</span>
          <span className="tabular-nums">
            {value} / {goal} {habit.unit}
          </span>
        </div>
      ) : (
        <span className="text-xs tabular-nums text-foreground">
          {value}{' '}
          <span className="text-muted-foreground">
            / {goal} {habit.unit}
          </span>
        </span>
      )}
      <Progress value={goal > 0 ? Math.min(100, (value / goal) * 100) : 0} />
      <div className="flex gap-2">
        <Input
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={String(value)}
          aria-label={`Log today's ${habit.name}`}
          className={variant === 'row' ? 'h-7 max-w-32' : 'h-7'}
        />
        <Button
          size="sm"
          disabled={checkIn.isLoading || checkIn.isSaving || draft === ''}
          onClick={commit}
        >
          Log
        </Button>
      </div>
    </div>
  )
}
