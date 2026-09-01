import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import type { Icon } from '@phosphor-icons/react'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible'

export function NavMain({
  label,
  items,
}: {
  label: string
  items: {
    title: string
    url: string
    icon?: Icon
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const { pathname } = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url
          const isSubItemActive = item.items?.some(
            (subItem) => pathname === subItem.url,
          )

          return (
            <Collapsible
              key={item.title}
              defaultOpen={isActive || isSubItemActive}
              className="group/collapsible"
              render={
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    render={<Link to={item.url} />}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <>
                      <CollapsibleTrigger
                        render={
                          <SidebarMenuAction className="group-data-open/collapsible:rotate-90">
                            <ArrowRightIcon />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        }
                      />
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                isActive={pathname === subItem.url}
                                render={
                                  <Link to={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                }
                              />
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </>
                  ) : null}
                </SidebarMenuItem>
              }
            />
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
