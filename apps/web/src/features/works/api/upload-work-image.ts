import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import { useMutation } from '@tanstack/react-query'

type UploadImageResponse = {
  url: string
}

// Generic upload endpoint (not scoped to works) — lives here since works is
// its only caller so far. Move to a shared features/uploads if that changes.
export const uploadWorkImage = ({
  file,
}: {
  file: File
}): Promise<UploadImageResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/uploads/images', formData)
}

type UseUploadWorkImageOptions = {
  mutationConfig?: MutationConfig<typeof uploadWorkImage>
}

export const useUploadWorkImage = ({
  mutationConfig,
}: UseUploadWorkImageOptions = {}) => {
  return useMutation({
    ...mutationConfig,
    mutationFn: uploadWorkImage,
  })
}
