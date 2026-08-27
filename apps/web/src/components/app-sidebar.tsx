'use client'

import * as React from 'react'

import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  LifebuoyIcon,
  ListChecksIcon,
  PaperPlaneTiltIcon,
  SquaresFourIcon,
  VaultIcon,
} from '@phosphor-icons/react'
import { Link, useLocation, useRouteContext } from '@tanstack/react-router'

const dashboardRoute = {
  title: 'Dashboard',
  url: '/dashboard',
  icon: <SquaresFourIcon />,
}

const data = {
  navMain: [
    {
      title: 'Habits',
      url: '/dashboard/habits',
      icon: ListChecksIcon,
    },
    {
      title: 'Vault',
      url: '/dashboard/vault',
      icon: VaultIcon,
      items: [
        { title: 'Books', url: '/dashboard/vault/books' },
        { title: 'Movies', url: '/dashboard/vault/movies' },
        { title: 'Articles', url: '/dashboard/vault/articles' },
        { title: 'Courses', url: '/dashboard/vault/courses' },
      ],
    },
  ],
  navSecondary: [
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
  ],
}

// Single source of truth for "which page is this" — the dashboard header
// looks up the current route's icon/title here instead of duplicating it.
// navMain icons are components (NavMain renders them as `<item.icon />`), so
// they're instantiated here to match dashboardRoute's already-rendered icon.
export const navRoutes = [
  dashboardRoute,
  ...data.navMain.map((item) => ({ ...item, icon: <item.icon /> })),
]
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { session } = useRouteContext({ from: '/dashboard' })
  const user = session.data?.user
  const { pathname } = useLocation()

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-1">
          <span className="truncate text-sm font-medium">LifeOS</span>
          <NavUser user={user} />
        </div>
      </SidebarHeader>
      <div className="mx-2 border-t border-dashed border-sidebar-border" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Dashboard"
                isActive={pathname === dashboardRoute.url}
                render={<Link to={dashboardRoute.url} />}
              >
                {dashboardRoute.icon}
                <span>{dashboardRoute.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <div className="mx-2 border-t border-dashed border-sidebar-border" />
        <NavMain label="Second Brain" items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
