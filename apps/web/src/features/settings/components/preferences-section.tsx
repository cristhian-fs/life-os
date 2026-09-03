import { LANGUAGES } from '#/components/language-switcher'
import { useTheme } from '#/components/theme-provider'
import type { Theme } from '#/components/theme-provider'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from 'react-i18next'

export function PreferencesSection() {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()

  const themeLabel: Record<Theme, string> = {
    light: t('navUser.themeLight'),
    dark: t('navUser.themeDark'),
    system: t('navUser.themeSystem'),
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">
        {t('settings.preferences.heading')}
      </h3>
      <FieldGroup>
        <Field>
          <FieldLabel>{t('navUser.language')}</FieldLabel>
          <Select
            value={i18n.language}
            onValueChange={(v) => v && i18n.changeLanguage(v)}
          >
            <SelectTrigger className="w-56">
              <SelectValue>
                {(value: string) =>
                  LANGUAGES.find((l) => l.code === value)?.label ?? value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(({ code, label }) => (
                <SelectItem key={code} value={code}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>{t('navUser.theme')}</FieldLabel>
          <Select value={theme} onValueChange={(v) => setTheme(v as Theme)}>
            <SelectTrigger className="w-56">
              <SelectValue>{(value: Theme) => themeLabel[value]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(themeLabel) as Theme[]).map((value) => (
                <SelectItem key={value} value={value}>
                  {themeLabel[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </div>
  )
}
