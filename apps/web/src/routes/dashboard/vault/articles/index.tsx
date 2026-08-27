import { VaultTypePage } from '#/features/works/components/vault-type-page'
import { WorkType } from '#/types/api'
import { NewspaperIcon } from '@phosphor-icons/react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/vault/articles/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <VaultTypePage type={WorkType.ARTICLE} icon={NewspaperIcon} />
}
