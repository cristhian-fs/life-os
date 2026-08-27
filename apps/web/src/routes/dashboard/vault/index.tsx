import { createFileRoute, redirect } from '@tanstack/react-router'

// The sidebar's "Vault" row links here directly (it's a real route, not just
// a collapsible toggle) — there's no combined view across types, so send it
// straight to the first sub-page instead of a dead-end.
export const Route = createFileRoute('/dashboard/vault/')({
  beforeLoad: () => redirect({ to: '/dashboard/vault/books', throw: true }),
})
