'use client'

import * as React from 'react'

import { useNavRoutes } from '#/hooks/use-nav-routes'
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
import { Link, useLocation, useRouteContext } from '@tanstack/react-router'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { session } = useRouteContext({ from: '/dashboard' })
  const user = session.data?.user
  const { pathname } = useLocation()
  const { dashboardRoute, navMain, navSecondary } = useNavRoutes()

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
                tooltip={dashboardRoute.title}
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
        <NavMain label="Second Brain" items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
