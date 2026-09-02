import { useUploadImage } from '#/features/uploads/api/upload-image'
import { authClient } from '#/lib/auth-client'
import { queryClient } from '#/lib/react-query'
import { getInitials } from '#/lib/utils'
import { toast } from '#/components/ui/toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

/** Profile picture — uploads to R2 via the same generic upload endpoint work
 * covers use, then persists the URL onto the user via Better Auth's
 * updateUser (core client method, no plugin needed). Invalidates the
 * ['session'] query so the sidebar avatar updates without a reload. */
export function ProfilePictureField({
  name,
  image,
}: {
  name: string
  image: string | null | undefined
}) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  // updateUser returns { data, error } rather than throwing, so every call
  // site needs its own error check — this wraps that plus the shared
  // session-cache invalidation so the sidebar avatar updates without reload.
  const setImage = async (image: string | null, successMessage: string) => {
    const { error } = await authClient.updateUser({ image })
    if (error) {
      toast.add({ title: error.message, type: 'error' })
      return
    }
    await queryClient.invalidateQueries({ queryKey: ['session'] })
    toast.add({ title: successMessage, type: 'success' })
  }

  const upload = useUploadImage({
    mutationConfig: {
      onSuccess: (data) =>
        setImage(data.url, t('settings.account.imageUpdatedToast')),
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })

  const handleRemove = () =>
    setImage(null, t('settings.account.imageRemovedToast'))

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.add({ title: t('work.image.tooLarge'), type: 'error' })
      return
    }
    upload.mutate({ file })
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-16">
        {upload.isPending ? (
          <AvatarFallback>
            <Spinner />
          </AvatarFallback>
        ) : (
          <>
            <AvatarImage src={image ?? ''} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </>
        )}
      </Avatar>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">
          {t('settings.account.profilePicture')}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            disabled={upload.isPending}
            onClick={() => inputRef.current?.click()}
          >
            {t('settings.account.uploadImage')}
          </Button>
          {image && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRemove}
            >
              {t('settings.account.remove')}
            </Button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}
