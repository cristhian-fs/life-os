import { useUploadWorkImage } from '#/features/works/api/upload-work-image'
import { toast } from '#/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ImageSquareIcon, XIcon } from '@phosphor-icons/react'
import { useRef } from 'react'
import type { ClipboardEvent } from 'react'

/** Cover-art picker for a work item — uploads immediately on file select and reports back the resulting URL. */
export function WorkImageField({
  value,
  onChange,
}: {
  value: string | null
  onChange: (url: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadWorkImage({
    mutationConfig: {
      onSuccess: (data) => onChange(data.url),
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })

  const handlePaste = (e: ClipboardEvent<HTMLButtonElement>) => {
    const items = e.clipboardData.items

    if (!items.length) return

    for (const item of items) {
      // Filter and pick only image files
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          // File limit
          if (file.size > 5 * 1024 * 1024) {
            toast.add({ title: 'Image must be up to 5MB.' })
            return
          }

          upload.mutate({ file })
          e.preventDefault()
          break
        }
      }
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onPaste={handlePaste}
        disabled={upload.isPending}
        className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-input bg-input/20 text-muted-foreground transition-colors hover:bg-input/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50"
      >
        {upload.isPending ? (
          <Spinner />
        ) : value ? (
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <ImageSquareIcon className="size-6" />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) upload.mutate({ file })
        }}
      />
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">Cover image, up to 5MB.</p>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-fit"
            onClick={() => onChange(null)}
          >
            <XIcon />
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}
