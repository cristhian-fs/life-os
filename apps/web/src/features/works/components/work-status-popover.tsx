import { useUpdateWork } from '#/features/works/api/update-work'
import {
  workStatusBadgeVariant,
  workStatusDotColor,
  workStatusLabel,
} from '#/features/works/lib/format'
import { WorkStatus } from '#/types/api'
import type { Work } from '#/types/api'
import { toast } from '#/components/ui/toast'
import { QuickSelectPopover } from '@/components/quick-select-popover'
import type { QuickSelectOption } from '@/components/quick-select-popover'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { StarIcon } from '@phosphor-icons/react'
import { useState } from 'react'

const STATUS_OPTIONS: QuickSelectOption<WorkStatus>[] = Object.values(
  WorkStatus,
).map((status) => ({
  value: status,
  label: workStatusLabel[status],
  icon: (
    <span className={cn('size-2 rounded-full', workStatusDotColor[status])} />
  ),
}))

const TERMINAL_STATUSES: WorkStatus[] = [
  WorkStatus.COMPLETED,
  WorkStatus.ABANDONED,
]

/**
 * Status badge that opens a quick-select popover; picking Completed/Abandoned
 * follows up with a second popover asking for a rating, in the same spot —
 * same trigger, same open state, just a different phase of content, so it
 * stays correctly anchored (a second independently-anchored Popover.Root has
 * nothing to position itself against once the first one's trigger unmounts).
 */
export function WorkStatusPopover({ work }: { work: Work }) {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<'status' | 'rating'>('status')

  const updateWork = useUpdateWork({
    mutationConfig: {
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })

  const close = () => {
    setOpen(false)
    setPhase('status')
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      close()
      return
    }
    setOpen(true)
  }

  const handleSelectStatus = (status: WorkStatus) => {
    if (status === work.status) {
      close()
      return
    }
    updateWork.mutate({ id: work.id, data: { status } })
    if (TERMINAL_STATUSES.includes(status)) {
      setPhase('rating')
    } else {
      close()
    }
  }

  const handleSelectRating = (rating: number) => {
    updateWork.mutate({ id: work.id, data: { rating } })
    close()
  }

  const trigger = (
    <Badge
      variant={workStatusBadgeVariant[work.status]}
      className="cursor-pointer"
    >
      {workStatusLabel[work.status]}
    </Badge>
  )

  if (phase === 'rating') {
    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger render={trigger} />
        <PopoverContent align="start" className="w-auto">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium">Rate it?</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleSelectRating(n)}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  className="rounded-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <StarIcon weight="fill" className="size-4" />
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit self-end"
              onClick={close}
            >
              Skip
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <QuickSelectPopover
      trigger={trigger}
      options={STATUS_OPTIONS}
      value={work.status}
      onSelect={handleSelectStatus}
      open={open}
      onOpenChange={handleOpenChange}
    />
  )
}
