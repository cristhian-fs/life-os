import { AppSidebar } from '#/components/app-sidebar'
import { DashboardHeader } from '#/components/dashboard-header'
import { SidebarInset, SidebarProvider } from '#/components/ui/sidebar'
import { authClient } from '#/lib/auth-client'
import { queryClient } from '#/lib/react-query'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
  // beforeLoad reruns on every navigation/preload (it's not cached by the router,
  // per TanStack Router's docs), so hovering many links in a row would otherwise
  // hit /api/auth/get-session once per hover. Routing it through the query client
  // dedupes/caches it for queryClient's default staleTime (30s).
  beforeLoad: async () => {
    const session = await queryClient.ensureQueryData({
      queryKey: ['session'],
      queryFn: () => authClient.getSession(),
    })
    if (!session.data) redirect({ to: '/login', throw: true })
    return { session }
  },
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <DashboardHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
