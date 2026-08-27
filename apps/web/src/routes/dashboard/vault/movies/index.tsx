import { VaultTypePage } from '#/features/works/components/vault-type-page'
import { WorkType } from '#/types/api'
import { FilmReelIcon } from '@phosphor-icons/react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/vault/movies/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <VaultTypePage type={WorkType.MOVIE} icon={FilmReelIcon} />
}
