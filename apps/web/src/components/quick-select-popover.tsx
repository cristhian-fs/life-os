import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CheckIcon } from '@phosphor-icons/react'

export type QuickSelectOption<T extends string> = {
  value: T
  label: string
  icon?: React.ReactNode
}

/**
 * A small popover for picking one value from a short list — click the
 * trigger, pick, done. Built for the work-status picker; kept generic
 * (options in, value out) so a future tags picker can reuse it too.
 */
export function QuickSelectPopover<T extends string>({
  trigger,
  options,
  value,
  onSelect,
  open,
  onOpenChange,
}: {
  trigger: React.ReactElement
  options: QuickSelectOption<T>[]
  value: T
  onSelect: (value: T) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger nativeButton={false} render={trigger} />
      <PopoverContent align="start" className="w-44 gap-0.5 p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground',
              option.value === value && 'bg-accent text-accent-foreground',
            )}
          >
            {option.icon}
            <span className="flex-1 truncate">{option.label}</span>
            {option.value === value && (
              <CheckIcon className="size-3.5 shrink-0" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
