import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { t } = useTranslation()

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">{t('home.title')}</h1>
      <p className="mt-4 text-lg">
        {t('home.editPrefix')} <code>src/routes/index.tsx</code>{' '}
        {t('home.editSuffix')}
      </p>
    </div>
  )
}
