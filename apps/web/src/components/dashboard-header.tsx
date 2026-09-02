import { useNavRoutes } from '#/hooks/use-nav-routes'
import { useLocation } from '@tanstack/react-router'

export function DashboardHeader() {
  const { pathname } = useLocation()
  const { dashboardRoute, navRoutes } = useNavRoutes()
  // Exact match first (most routes); fall back to the longest navRoutes
  // entry that prefixes the path, so a sub-route like /dashboard/habits/:id
  // still shows "Habits" instead of a blank header.
  const route =
    navRoutes.find((r) => r.url === pathname) ??
    navRoutes
      .filter((r) => r.url !== '/dashboard' && pathname.startsWith(`${r.url}/`))
      .reduce<(typeof navRoutes)[number] | undefined>(
        (longest, r) =>
          !longest || r.url.length > longest.url.length ? r : longest,
        undefined,
      )

  return (
    <header className="flex items-center gap-2 border-b px-6 py-4">
      <span className="text-muted-foreground [&_svg]:size-4">
        {route?.icon}
      </span>
      <h1 className="text-sm font-medium">
        {route?.title ?? dashboardRoute.title}
      </h1>
    </header>
  )
}
