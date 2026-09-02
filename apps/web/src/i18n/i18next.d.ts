import 'i18next'
import type { i18nConfig, defaultNS } from './index'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: (typeof i18nConfig.resources)['pt-BR']
  }
}
