import {
  LifebuoyIcon,
  ListBulletsIcon,
  ListChecksIcon,
  PaperPlaneTiltIcon,
  SquaresFourIcon,
  VaultIcon,
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

// Titles are translated, so this has to be a hook (not a module-level
// constant) — both AppSidebar and DashboardHeader (which needs the flat
// navRoutes list to resolve the current page's title) call it.
export function useNavRoutes() {
  const { t } = useTranslation()

  const dashboardRoute = {
    title: t('routes.dashboard'),
    url: '/dashboard',
    icon: <SquaresFourIcon />,
  }

  const navMain = [
    {
      title: t('routes.habits'),
      url: '/dashboard/habits',
      icon: ListChecksIcon,
    },
    {
      title: t('routes.vault.index'),
      url: '/dashboard/vault',
      icon: VaultIcon,
      items: [
        { title: t('routes.vault.books'), url: '/dashboard/vault/books' },
        { title: t('routes.vault.movies'), url: '/dashboard/vault/movies' },
        {
          title: t('routes.vault.articles'),
          url: '/dashboard/vault/articles',
        },
        { title: t('routes.vault.courses'), url: '/dashboard/vault/courses' },
        { title: t('routes.vault.videos'), url: '/dashboard/vault/videos' },
      ],
    },
    {
      title: t('routes.purchaseWishlist'),
      url: '/dashboard/purchase-wishlist',
      icon: ListBulletsIcon,
    },
  ]

  const navSecondary = [
    {
      title: 'Support',
      url: '#',
      icon: <LifebuoyIcon />,
    },
    {
      title: 'Feedback',
      url: '#',
      icon: <PaperPlaneTiltIcon />,
    },
  ]

  // Single source of truth for "which page is this" — the dashboard header
  // looks up the current route's icon/title here instead of duplicating it.
  // navMain icons are components (NavMain renders them as `<item.icon />`),
  // so they're instantiated here to match dashboardRoute's already-rendered icon.
  const navRoutes = [
    dashboardRoute,
    ...navMain.map((item) => ({ ...item, icon: <item.icon /> })),
  ]

  return { dashboardRoute, navMain, navSecondary, navRoutes }
}
