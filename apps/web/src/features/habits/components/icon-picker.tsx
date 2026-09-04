import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from '@/components/ui/emoji-picker'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { SmileyIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

/** Emoji trigger + popover picker for a habit's `icon` field. Renders the
 * picked emoji on the trigger itself, or a placeholder glyph when unset. */
export function IconPicker({
  value,
  onChange,
}: {
  value: string | null
  onChange: (icon: string) => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 text-base"
            aria-label={t('habits.form.iconPicker')}
          >
            {value ?? (
              <SmileyIcon className="size-4 text-muted-foreground" />
            )}
          </Button>
        }
      />
      <PopoverContent side="bottom" align="start" className="w-fit p-0">
        <EmojiPicker
          className="h-72"
          onEmojiSelect={({ emoji }) => {
            onChange(emoji)
            setOpen(false)
          }}
        >
          <EmojiPickerSearch />
          <EmojiPickerContent />
          <EmojiPickerFooter />
        </EmojiPicker>
      </PopoverContent>
    </Popover>
  )
}
