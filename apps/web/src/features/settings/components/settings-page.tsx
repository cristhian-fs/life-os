import { Separator } from '#/components/ui/separator'
import { AccountSection } from '#/features/settings/components/account-section'
import { PreferencesSection } from '#/features/settings/components/preferences-section'
import { SecuritySection } from '#/features/settings/components/security-section'
import { useRouteContext } from '@tanstack/react-router'

export function SettingsPage() {
  const { session } = useRouteContext({ from: '/dashboard' })
  const user = session.data?.user

  if (!user) return null

  return (
    <div className="p-2 h-full">
      <div className="rounded-xl bg-card ring-1 ring-foreground/10 h-full">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-12 p-6">
          <AccountSection
            name={user.name}
            email={user.email}
            image={user.image}
          />
          <Separator />
          <SecuritySection />
          <Separator />
          <PreferencesSection />
        </div>
      </div>
    </div>
  )
}
