import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import { useMutation } from '@tanstack/react-query'

type FetchOgImageResponse = {
  url: string | null
}

// Server-side because browsers can't fetch most third-party pages (CORS) —
// the API fetches the page's og:image and re-hosts it on R2 for us.
export const fetchOgImage = ({
  pageUrl,
}: {
  pageUrl: string
}): Promise<FetchOgImageResponse> => {
  return api.post('/uploads/og-image', { pageUrl })
}

type UseFetchOgImageOptions = {
  mutationConfig?: MutationConfig<typeof fetchOgImage>
}

export const useFetchOgImage = ({
  mutationConfig,
}: UseFetchOgImageOptions = {}) => {
  return useMutation({
    ...mutationConfig,
    mutationFn: fetchOgImage,
  })
}
