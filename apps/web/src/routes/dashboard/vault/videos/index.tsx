import { VaultTypePage } from '#/features/works/components/vault-type-page'
import { WorkType } from '#/types/api'
import { VideoCameraIcon } from '@phosphor-icons/react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/vault/videos/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <VaultTypePage type={WorkType.VIDEO} icon={VideoCameraIcon} />
}
