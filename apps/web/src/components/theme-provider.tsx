import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light' | 'system'

export const COLOR_THEMES = [
  'default',
  'absolutely',
  'bearded-oled',
  'catppuccin',
  'codex',
  'crimson-evernight',
  'everforest',
  'github',
  'gruvbox',
  'hub',
  'linear',
  'notion',
  'one',
] as const

export type ColorTheme = (typeof COLOR_THEMES)[number]

export const COLOR_THEME_LABELS: Record<ColorTheme, string> = {
  default: 'Default',
  absolutely: 'Absolutely',
  'bearded-oled': 'Bearded OLED',
  catppuccin: 'Catppuccin',
  codex: 'Codex',
  'crimson-evernight': 'Crimson Evernight',
  everforest: 'Everforest',
  github: 'GitHub',
  gruvbox: 'Gruvbox',
  hub: 'Hub',
  linear: 'Linear',
  notion: 'Notion',
  one: 'One',
}

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ResolvedTheme = 'light' | 'dark'

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: ResolvedTheme
  colorTheme: ColorTheme
  setColorTheme: (colorTheme: ColorTheme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'light',
  colorTheme: 'default',
  setColorTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const colorThemeStorageKey = `${storageKey}-color`

  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  )
  const [colorTheme, setColorTheme] = useState<ColorTheme>(
    () =>
      (localStorage.getItem(colorThemeStorageKey) as ColorTheme) || 'default',
  )
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

  useEffect(() => {
    const root = window.document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const resolved: ResolvedTheme =
        theme === 'system' ? (media.matches ? 'dark' : 'light') : theme

      root.classList.remove('light', 'dark')
      root.classList.add(resolved)
      setResolvedTheme(resolved)
    }

    apply()

    if (theme !== 'system') return
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement

    if (colorTheme === 'default') {
      delete root.dataset.colorTheme
    } else {
      root.dataset.colorTheme = colorTheme
    }
  }, [colorTheme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    resolvedTheme,
    colorTheme,
    setColorTheme: (colorTheme: ColorTheme) => {
      localStorage.setItem(colorThemeStorageKey, colorTheme)
      setColorTheme(colorTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
