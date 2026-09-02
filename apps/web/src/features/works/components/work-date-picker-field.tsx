import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { Matcher } from 'react-day-picker'
import { useTranslation } from 'react-i18next'

/** Date-picker field for an optional ISO-string form value ("" input, "" output — null when cleared). */
export function WorkDatePickerField({
  id,
  value,
  onChange,
  disabledDays,
}: {
  id: string
  value: string | null
  onChange: (value: string | null) => void
  /** react-day-picker matcher — defaults to disabling future dates only, so past/backdated values stay pickable. */
  disabledDays?: Matcher | Matcher[]
}) {
  const { t } = useTranslation()
  const selected = value ? new Date(value) : undefined

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            id={id}
            className={cn(
              'w-full max-w-60 justify-start text-left font-normal',
              !selected && 'text-muted-foreground',
            )}
          />
        }
      >
        {selected ? (
          format(selected, 'PPP')
        ) : (
          <span>{t('work.datePicker.pickDate')}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? new Date()}
          disabled={disabledDays ?? { after: new Date() }}
          onSelect={(date) => onChange(date ? date.toISOString() : null)}
        />
      </PopoverContent>
    </Popover>
  )
}
