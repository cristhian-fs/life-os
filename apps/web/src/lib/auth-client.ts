import { createAuthClient } from 'better-auth/react'

// better-auth's own client appends /api/auth itself (see api's
// create-app.ts, mounted at /api/auth/*) — same origin api-client.ts uses,
// just without the /api suffix it adds manually for REST calls.
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
})
