import { api } from '#/lib/api-client'
import type { MutationConfig } from '#/lib/react-query'
import { useMutation } from '@tanstack/react-query'

type UploadImageResponse = {
  url: string
}

// Generic upload endpoint, shared by anything that needs an image hosted on
// R2 — work covers and the user's profile picture today.
export const uploadImage = ({
  file,
}: {
  file: File
}): Promise<UploadImageResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/uploads/images', formData)
}

type UseUploadImageOptions = {
  mutationConfig?: MutationConfig<typeof uploadImage>
}

export const useUploadImage = ({
  mutationConfig,
}: UseUploadImageOptions = {}) => {
  return useMutation({
    ...mutationConfig,
    mutationFn: uploadImage,
  })
}
