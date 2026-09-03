import { useLogHabitDay } from '#/features/habits/api/log-habit-day'
import { buildHeatmapGrid } from '#/features/habits/lib/heatmap-grid'
import type { HeatmapCell } from '#/features/habits/lib/heatmap-grid'
import type { Habit, HabitCalendarMapResponse } from '#/types/api'
import { HabitStatus, HabitType } from '#/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { TFunction } from 'i18next'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const cellClass = { default: 'size-2.5', compact: 'size-2' } as const
const gapClass = { default: 'gap-1', compact: 'gap-0.5' } as const

const monthLabel = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
const dayLabel = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

export function HabitCalendarHeatmap({
  habit,
  data,
  size = 'default',
}: {
  habit: Habit
  data: HabitCalendarMapResponse
  size?: 'default' | 'compact'
}) {
  const { t } = useTranslation()
  const { logDay: logHabitDay, isPending } = useLogHabitDay(habit.id)
  const canLog = habit.status === HabitStatus.ACTIVE

  const weeks = buildHeatmapGrid(habit.created_at, data)
  const cell = cellClass[size]
  const gap = gapClass[size]

  const logDay = (
    date: Date,
    value: { value_boolean?: boolean | null; value_numeric?: number | null },
  ) => {
    if (!canLog) return undefined
    // Async (not fire-and-forget) so the numeric popover can close itself
    // once the entry actually lands, instead of closing optimistically.
    return logHabitDay(date.toISOString(), value)
  }

  return (
    <div className="overflow-x-hidden pb-1">
      <div className={cn('flex justify-end', gap)}>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className={cn('flex flex-col', gap)}>
            <span
              className={cn(
                cell,
                'mb-0.5 whitespace-nowrap text-[9px] leading-none text-muted-foreground',
              )}
            >
              {week.showMonth ? monthLabel(week.weekStart) : ''}
            </span>
            {week.days.map((day, dayIndex) => (
              <HeatmapDayCell
                key={dayIndex}
                habit={habit}
                cell={cell}
                day={day}
                canLog={canLog}
                pending={isPending}
                onLog={(date, value) => logDay(date, value)}
                t={t}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function HeatmapDayCell({
  habit,
  cell,
  day,
  canLog,
  pending,
  onLog,
  t,
}: {
  habit: Habit
  cell: string
  day: HeatmapCell
  canLog: boolean
  pending: boolean
  onLog: (
    date: Date,
    value: { value_boolean?: boolean | null; value_numeric?: number | null },
  ) => Promise<unknown> | undefined
  t: TFunction
}) {
  if (day.kind === 'empty') {
    return <div className={cell} />
  }

  if (day.kind === 'before-habit') {
    return (
      <Tooltip>
        <TooltipTrigger
          render={<div className={cn(cell, 'rounded-xs bg-muted/20')} />}
        />
        <TooltipContent>
          {t('habits.detail.beforeHabitExisted', {
            date: dayLabel(day.date),
          })}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <DayCell
      habit={habit}
      date={day.date}
      point={day.point}
      canLog={canLog}
      pending={pending}
      cell={cell}
      onLog={(value) => onLog(day.date, value)}
      t={t}
    />
  )
}

function DayCell({
  habit,
  date,
  point,
  canLog,
  pending,
  cell,
  onLog,
  t,
}: {
  habit: Habit
  date: Date
  point: HabitCalendarMapResponse[number] | undefined
  canLog: boolean
  pending: boolean
  cell: string
  onLog: (value: {
    value_boolean?: boolean | null
    value_numeric?: number | null
  }) => Promise<unknown> | undefined
  t: TFunction
}) {
  const [draft, setDraft] = useState('')
  const [open, setOpen] = useState(false)
  const isNumeric = habit.type === HabitType.NUMERIC
  const done = !!point && point.percentage > 0
  const tooltip = `${dayLabel(date)}${point ? ` · ${Math.round(Number(point.percentage))}%` : ` · ${t('habits.detail.notTracked')}`}`

  const swatch = cn(
    cell,
    'rounded-xs outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed',
    canLog && 'cursor-pointer hover:ring-1 hover:ring-foreground/30',
    point ? 'bg-primary' : 'bg-muted',
    point && point.percentage === 0 && 'bg-muted',
  )
  const swatchStyle =
    point && point.percentage > 0
      ? { opacity: Math.max(0.2, point.percentage / 100) }
      : undefined

  if (!isNumeric) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              disabled={!canLog || pending}
              onClick={() => onLog({ value_boolean: !done })}
              aria-label={t('habits.detail.logAriaLabel', {
                name: habit.name,
                date: dayLabel(date),
              })}
              className={swatch}
              style={swatchStyle}
            />
          }
        />
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    )
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = draft === '' ? null : Number(draft)
    if (value === null || Number.isNaN(value)) return
    onLog({ value_numeric: value })?.then(() => {
      setDraft('')
      setOpen(false)
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <button
                  type="button"
                  disabled={!canLog || pending}
                  aria-label={t('habits.detail.logAriaLabel', {
                    name: habit.name,
                    date: dayLabel(date),
                  })}
                  className={swatch}
                  style={swatchStyle}
                />
              }
            />
          }
        />
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-48">
        <PopoverTitle>{dayLabel(date)}</PopoverTitle>
        <form onSubmit={submit} className="flex gap-2">
          <Input
            type="number"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={habit.goal_value ? String(habit.goal_value) : '0'}
            aria-label={t('habits.detail.valueAriaLabel', {
              name: habit.name,
              date: dayLabel(date),
            })}
            className="h-7"
          />
          <Button type="submit" size="sm" disabled={draft === ''}>
            {t('habits.detail.logButton')}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}
