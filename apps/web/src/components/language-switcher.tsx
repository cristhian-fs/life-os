import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslation } from 'react-i18next'

// Language names shown as endonyms (each in its own language), not
// translated — that's the standard convention, same as any OS language menu.
const LANGUAGES = [
  { code: 'en-US', label: 'English' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
] as const

/** Language submenu for the user dropdown — mirrors the Theme submenu above it. */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>{t('navUser.language')}</DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {LANGUAGES.map(({ code, label }) => (
            <DropdownMenuItem
              key={code}
              onClick={() => i18n.changeLanguage(code)}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}
