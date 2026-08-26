import Axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json'
  }

  config.withCredentials = true
  return config
}

export const api = Axios.create({
  // Every backend route is mounted under /api (see apps/api's app.ts) —
  // every hook here calls e.g. api.get('/habits'), not '/api/habits'.
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
})

api.interceptors.request.use(authRequestInterceptor)
// Every hook in features/*/api types its return as the bare response body
// (e.g. Promise<Habit[]>) — unwrap .data here once instead of at every call site.
api.interceptors.response.use((response) => response.data)
