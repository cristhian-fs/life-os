import type { HabitBestStreaksResponse } from '#/types/api'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

// The API already returns streaks longest-first — that order doubles as
// rank, so the top 3 just read their color off their own index instead of
// a separate "is this a top streak" lookup.
const rankColor = ['bg-primary', 'bg-primary/70', 'bg-primary/45'] as const

/** Horizontal bar per streak, in the order the API returns them (longest
 * first) — bar length relative to the longest streak, dates flanking each
 * bar left/right. */
export function HabitBestStreaksChart({
  data,
}: {
  data: HabitBestStreaksResponse
}) {
  const { t } = useTranslation()

  if (data.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        {t('habits.detail.noStreaksYet')}
      </p>
    )
  }

  const max = data[0].streak_num || 1

  return (
    <div className="flex flex-col gap-2">
      {data.map((streak, i) => (
        <div
          key={`${streak.from}-${streak.to}`}
          className="flex items-center gap-2 text-xs"
        >
          <span className="w-20 shrink-0 truncate text-right text-muted-foreground">
            {formatDate(streak.from)}
          </span>
          <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-muted/30">
            <div
              className={cn(
                'h-full rounded-full',
                rankColor[i] ?? 'bg-muted-foreground/30',
              )}
              style={{
                width: `${Math.max(4, (streak.streak_num / max) * 100)}%`,
              }}
            />
          </div>
          <span className="w-20 shrink-0 truncate text-muted-foreground">
            {formatDate(streak.to)}
          </span>
          <span className="w-10 shrink-0 text-right font-medium tabular-nums">
            {streak.streak_num}d
          </span>
        </div>
      ))}
    </div>
  )
}
