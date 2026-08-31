import { VaultOverviewPage } from '#/features/works/components/vault-overview-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/vault/')({
  component: VaultOverviewPage,
})
