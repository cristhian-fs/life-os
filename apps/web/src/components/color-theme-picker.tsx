import {
  COLOR_THEMES,
  COLOR_THEME_LABELS,
  useTheme,
} from '#/components/theme-provider'
import type { ColorTheme } from '#/components/theme-provider'
import { CheckIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export function ColorThemePicker() {
  const { colorTheme, setColorTheme, resolvedTheme } = useTheme()

  return (
    <div role="radiogroup" className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {COLOR_THEMES.map((id) => (
        <ColorThemeSwatch
          key={id}
          id={id}
          selected={colorTheme === id}
          isDark={resolvedTheme === 'dark'}
          onSelect={() => setColorTheme(id)}
        />
      ))}
    </div>
  )
}

function ColorThemeSwatch({
  id,
  selected,
  isDark,
  onSelect,
}: {
  id: ColorTheme
  selected: boolean
  isDark: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      title={COLOR_THEME_LABELS[id]}
      onClick={onSelect}
      data-color-theme={id === 'default' ? undefined : id}
      className={cn(
        'group flex flex-col items-center gap-1.5 rounded-lg p-1.5 outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isDark && 'dark',
      )}
    >
      <span
        className={cn(
          'relative flex size-10 items-center justify-center rounded-full border',
          selected && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
        )}
        style={{
          backgroundColor: 'var(--background)',
          borderColor: 'var(--border)',
        }}
      >
        <span
          className="size-4 rounded-full"
          style={{ backgroundColor: 'var(--primary)' }}
        />
        {selected && (
          <CheckIcon
            weight="bold"
            className="absolute -right-1 -bottom-1 size-3.5 rounded-full border border-background bg-primary p-0.5 text-primary-foreground"
          />
        )}
      </span>
      <span className="text-muted-foreground group-hover:text-foreground text-[11px] leading-none">
        {COLOR_THEME_LABELS[id]}
      </span>
    </button>
  )
}
