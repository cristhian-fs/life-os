import { useUpdateWork } from '#/features/works/api/update-work'
import { toast } from '#/components/ui/toast'
import { WorkStatus } from '#/types/api'
import type { Work } from '#/types/api'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  CaretDownIcon,
  CheckIcon,
  PlayIcon,
  XCircleIcon,
} from '@phosphor-icons/react'
import { useState } from 'react'

/**
 * Primary start/finish workflow for a work item — sets started_at/completed_at,
 * which the status quick-select popover (the badge) doesn't. Abandon sits one
 * tap deeper behind the finish button's dropdown since it's the less common
 * outcome, not a peer action to "finished".
 */
export function WorkProgressActions({ work }: { work: Work }) {
  const [abandonOpen, setAbandonOpen] = useState(false)

  const updateWork = useUpdateWork({
    mutationConfig: {
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })

  const markStarted = () => {
    updateWork.mutate({
      id: work.id,
      data: {
        status: WorkStatus.IN_PROGRESS,
        started_at: new Date().toISOString(),
      },
    })
  }

  const markFinished = () => {
    updateWork.mutate({
      id: work.id,
      data: {
        status: WorkStatus.COMPLETED,
        completed_at: new Date().toISOString(),
      },
    })
  }

  const markAbandoned = () => {
    updateWork.mutate({
      id: work.id,
      data: {
        status: WorkStatus.ABANDONED,
        completed_at: new Date().toISOString(),
      },
    })
    setAbandonOpen(false)
  }

  if (work.status === WorkStatus.TO_CONSUME) {
    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={updateWork.isPending}
        onClick={markStarted}
      >
        <PlayIcon />
        Mark as started
      </Button>
    )
  }

  if (work.status !== WorkStatus.IN_PROGRESS) return null

  return (
    <ButtonGroup>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={updateWork.isPending}
        onClick={markFinished}
      >
        <CheckIcon />
        Mark as finished
      </Button>
      <Popover open={abandonOpen} onOpenChange={setAbandonOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              disabled={updateWork.isPending}
            />
          }
        >
          <CaretDownIcon />
          <span className="sr-only">More finish options</span>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto p-1">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="w-full justify-start"
            onClick={markAbandoned}
          >
            <XCircleIcon />
            Mark as abandoned
          </Button>
        </PopoverContent>
      </Popover>
    </ButtonGroup>
  )
}
