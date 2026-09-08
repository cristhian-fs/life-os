import {
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import {
  COLOR_THEMES,
  COLOR_THEME_LABELS,
  useTheme,
} from '#/components/theme-provider'
import type { ColorTheme } from '#/components/theme-provider'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

/** Color theme submenu for the user dropdown — mirrors the Theme submenu above it. */
export function ColorThemeSwitcher() {
  const { t } = useTranslation()
  const { colorTheme, setColorTheme, resolvedTheme } = useTheme()

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        {t('navUser.colorTheme')}
        <span className="text-muted-foreground ml-auto text-xs">
          {COLOR_THEME_LABELS[colorTheme]}
        </span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuRadioGroup
            value={colorTheme}
            onValueChange={(value) => setColorTheme(value as ColorTheme)}
          >
            {COLOR_THEMES.map((id) => (
              <DropdownMenuRadioItem key={id} value={id}>
                <span
                  data-color-theme={id === 'default' ? undefined : id}
                  className={cn(
                    'size-3.5 shrink-0 rounded-full',
                    resolvedTheme === 'dark' && 'dark',
                  )}
                  style={{ backgroundColor: 'var(--primary)' }}
                />
                {COLOR_THEME_LABELS[id]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}
