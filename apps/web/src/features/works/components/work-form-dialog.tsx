import { useCreateWork } from '#/features/works/api/create-work'
import type { CreateWorkInput } from '#/features/works/api/create-work'
import { useFetchOgImage } from '#/features/works/api/fetch-og-image'
import { useUpdateWork } from '#/features/works/api/update-work'
import { useUploadWorkImage } from '#/features/works/api/upload-work-image'
import { fetchIsbnCover } from '#/features/works/lib/cover-fetch'
import {
  workFormEditDescription,
  workFormEditTitle,
  workFormNewDescription,
  workFormNewTitle,
  workStatusLabel,
  workTypeSingular,
} from '#/features/works/lib/format'
import { WorkStatus, WorkType } from '#/types/api'
import type { Work } from '#/types/api'
import { toast } from '#/components/ui/toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { QuestionIcon } from '@phosphor-icons/react'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { WorkDatePickerField } from './work-date-picker-field'
import { WorkImageField } from './work-image-field'

type WorkFormDialogProps = {
  trigger?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  type: WorkType
  work?: Work
}

type DetailValues = {
  isbn: string | null
  pages: number | null
  publisher: string | null
  runtime_minutes: number | null
  director: string | null
  source_name: string
  reading_time_minutes: number | null
  published_at: string | null
  platform: string | null
  instructor: string | null
  duration_hours: number | null
  duration_minutes: number | null
}

function detailForType(type: WorkType, detail: DetailValues) {
  switch (type) {
    case WorkType.BOOK:
      return {
        isbn: detail.isbn,
        pages: detail.pages,
        publisher: detail.publisher,
      }
    case WorkType.MOVIE:
      return {
        runtime_minutes: detail.runtime_minutes,
        director: detail.director,
      }
    case WorkType.ARTICLE:
      return {
        source_name: detail.source_name,
        reading_time_minutes: detail.reading_time_minutes,
        published_at: detail.published_at,
      }
    case WorkType.COURSE:
      return {
        platform: detail.platform,
        instructor: detail.instructor,
        duration_hours: detail.duration_hours,
      }
    case WorkType.VIDEO:
      return {
        platform: detail.platform,
        duration_minutes: detail.duration_minutes,
      }
  }
}

export function WorkFormDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
  type,
  work,
}: WorkFormDialogProps) {
  const { t } = useTranslation()
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const isEdit = !!work

  const createWork = useCreateWork({
    mutationConfig: {
      onSuccess: () => {
        toast.add({
          title: t('work.dialog.addedToast', { label: workTypeSingular(type) }),
          type: 'success',
        })
        setOpen(false)
      },
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })
  const updateWork = useUpdateWork({
    mutationConfig: {
      onSuccess: () => {
        toast.add({
          title: t('work.dialog.updatedToast', {
            label: workTypeSingular(type),
          }),
          type: 'success',
        })
        setOpen(false)
      },
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })
  // Auto-fills the cover image from the link's og:image when one is pasted
  // in — separate from WorkImageField's own upload mutation since it targets
  // a different field (image_url) via the form, not a local <img>.
  const autoOgImage = useFetchOgImage({
    mutationConfig: {
      onSuccess: (data) =>
        data.url && form.setFieldValue('image_url', data.url),
    },
  })
  // Same idea for books: Open Library's cover-by-ISBN endpoint fetched
  // client-side, then re-hosted via the same upload mutation WorkImageField uses.
  const autoIsbnCover = useUploadWorkImage({
    mutationConfig: {
      onSuccess: (data) => form.setFieldValue('image_url', data.url),
    },
  })

  const detail = work?.detail
  const form = useForm({
    defaultValues: {
      title: work?.title ?? '',
      creator: work?.creator ?? '',
      status: work?.status ?? WorkStatus.TO_CONSUME,
      external_url: work?.external_url ?? null,
      image_url: work?.image_url ?? null,
      rating: work?.rating ?? null,
      summary: work?.summary ?? null,
      started_at: work?.started_at ?? null,
      completed_at: work?.completed_at ?? null,
      type,
      detail: {
        isbn: (detail && 'isbn' in detail && detail.isbn) || null,
        pages: (detail && 'pages' in detail && detail.pages) || null,
        publisher:
          (detail && 'publisher' in detail && detail.publisher) || null,
        runtime_minutes:
          (detail && 'runtime_minutes' in detail && detail.runtime_minutes) ||
          null,
        director: (detail && 'director' in detail && detail.director) || null,
        source_name:
          (detail && 'source_name' in detail && detail.source_name) || '',
        reading_time_minutes:
          (detail &&
            'reading_time_minutes' in detail &&
            detail.reading_time_minutes) ||
          null,
        published_at:
          (detail && 'published_at' in detail && detail.published_at) || null,
        platform: (detail && 'platform' in detail && detail.platform) || null,
        instructor:
          (detail && 'instructor' in detail && detail.instructor) || null,
        duration_hours:
          (detail && 'duration_hours' in detail && detail.duration_hours) ||
          null,
        duration_minutes:
          (detail && 'duration_minutes' in detail && detail.duration_minutes) ||
          null,
      } satisfies DetailValues,
    },
    onSubmit: async ({ value }) => {
      if (isEdit) {
        updateWork.mutate({
          id: work.id,
          data: {
            title: value.title,
            creator: value.creator,
            status: value.status,
            rating: value.rating,
            summary: value.summary,
            external_url: value.external_url,
            started_at: value.started_at,
            completed_at: value.completed_at,
            image_url: value.image_url,
            detail: detailForType(type, value.detail),
          },
        })
      } else {
        createWork.mutate({
          data: {
            type,
            title: value.title,
            creator: value.creator,
            status: value.status,
            external_url: value.external_url,
            image_url: value.image_url,
            detail: detailForType(type, value.detail),
            started_at: value.started_at,
            completed_at: value.completed_at,
          } as CreateWorkInput,
        })
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? workFormEditTitle(type) : workFormNewTitle(type)}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? workFormEditDescription(type)
              : workFormNewDescription(type)}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="title"
              validators={{
                onBlur: z.string().min(1, t('work.fields.titleRequired')),
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('work.fields.title')}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="image_url">
              {(field) => (
                <Field>
                  <FieldLabel className="flex items-center gap-1.5">
                    {t('work.fields.coverImage')}
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            aria-label={t('work.fields.coverImageHelpLabel')}
                            className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                          />
                        }
                      >
                        <QuestionIcon className="size-3.5" />
                      </TooltipTrigger>
                      <TooltipContent>
                        {t('work.fields.coverImageHelp')}
                      </TooltipContent>
                    </Tooltip>
                  </FieldLabel>
                  <WorkImageField
                    value={field.state.value}
                    onChange={field.handleChange}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field
              name="creator"
              validators={{
                onBlur: z.string().min(1, t('work.fields.creatorRequired')),
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {type === WorkType.MOVIE
                        ? t('work.fields.creatorDirector')
                        : type === WorkType.COURSE
                          ? t('work.fields.creatorInstructor')
                          : type === WorkType.VIDEO
                            ? t('work.fields.creatorCreator')
                            : t('work.fields.creatorAuthor')}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            {type === WorkType.BOOK && (
              <form.Field name="detail.isbn">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      {t('work.fields.isbn')}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value ?? ''}
                      onChange={(e) =>
                        field.handleChange(e.target.value || null)
                      }
                      onBlur={() => {
                        if (
                          isEdit ||
                          !field.state.value ||
                          form.getFieldValue('image_url')
                        ) {
                          return
                        }
                        fetchIsbnCover(field.state.value).then(
                          (file) => file && autoIsbnCover.mutate({ file }),
                        )
                      }}
                      placeholder={t('books.form.isbnPlaceholder')}
                    />
                  </Field>
                )}
              </form.Field>
            )}

            {type === WorkType.BOOK && (
              <div className="flex gap-3">
                <form.Field name="detail.publisher">
                  {(field) => (
                    <Field className="flex-1">
                      <FieldLabel htmlFor={field.name}>
                        {t('work.fields.publisher')}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value ?? ''}
                        onChange={(e) =>
                          field.handleChange(e.target.value || null)
                        }
                      />
                    </Field>
                  )}
                </form.Field>
                <form.Field name="detail.pages">
                  {(field) => (
                    <Field className="flex-1">
                      <FieldLabel htmlFor={field.name}>
                        {t('work.fields.pages')}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        type="number"
                        value={field.state.value ?? ''}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value === ''
                              ? null
                              : Number(e.target.value),
                          )
                        }
                      />
                    </Field>
                  )}
                </form.Field>
              </div>
            )}

            {type === WorkType.MOVIE && (
              <form.Field name="detail.runtime_minutes">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      {t('work.fields.runtimeMinutes')}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      value={field.state.value ?? ''}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value === '' ? null : Number(e.target.value),
                        )
                      }
                    />
                  </Field>
                )}
              </form.Field>
            )}

            {type === WorkType.ARTICLE && (
              <div className="flex gap-3">
                <form.Field
                  name="detail.source_name"
                  validators={{
                    onBlur: z.string().min(1, t('work.fields.sourceRequired')),
                  }}
                >
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid} className="flex-1">
                        <FieldLabel htmlFor={field.name}>
                          {t('work.fields.source')}
                        </FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder={t('articles.form.sourcePlaceholder')}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>
                <form.Field name="detail.reading_time_minutes">
                  {(field) => (
                    <Field className="flex-1">
                      <FieldLabel htmlFor={field.name}>
                        {t('work.fields.readingTime')}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        type="number"
                        value={field.state.value ?? ''}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value === ''
                              ? null
                              : Number(e.target.value),
                          )
                        }
                      />
                    </Field>
                  )}
                </form.Field>
              </div>
            )}

            {type === WorkType.COURSE && (
              <div className="flex gap-3">
                <form.Field name="detail.platform">
                  {(field) => (
                    <Field className="flex-1">
                      <FieldLabel htmlFor={field.name}>
                        {t('work.fields.platform')}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value ?? ''}
                        onChange={(e) =>
                          field.handleChange(e.target.value || null)
                        }
                        placeholder={t('courses.form.platformPlaceholder')}
                      />
                    </Field>
                  )}
                </form.Field>
                <form.Field name="detail.duration_hours">
                  {(field) => (
                    <Field className="flex-1">
                      <FieldLabel htmlFor={field.name}>
                        {t('work.fields.durationHours')}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        type="number"
                        value={field.state.value ?? ''}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value === ''
                              ? null
                              : Number(e.target.value),
                          )
                        }
                      />
                    </Field>
                  )}
                </form.Field>
              </div>
            )}

            {type === WorkType.VIDEO && (
              <div className="flex gap-3">
                <form.Field name="detail.platform">
                  {(field) => (
                    <Field className="flex-1">
                      <FieldLabel htmlFor={field.name}>
                        {t('work.fields.platform')}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value ?? ''}
                        onChange={(e) =>
                          field.handleChange(e.target.value || null)
                        }
                        placeholder={t('videos.form.platformPlaceholder')}
                      />
                    </Field>
                  )}
                </form.Field>
                <form.Field name="detail.duration_minutes">
                  {(field) => (
                    <Field className="flex-1">
                      <FieldLabel htmlFor={field.name}>
                        {t('work.fields.durationMinutes')}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        type="number"
                        value={field.state.value ?? ''}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value === ''
                              ? null
                              : Number(e.target.value),
                          )
                        }
                      />
                    </Field>
                  )}
                </form.Field>
              </div>
            )}

            <form.Field name="status">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    {t('work.fields.status')}
                  </FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v as WorkStatus)}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue>
                        {(value: WorkStatus) => workStatusLabel(value)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(WorkStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {workStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <div className="flex flex-wrap items-start gap-3">
              <form.Field name="started_at">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      {t('work.fields.startedAt')}
                    </FieldLabel>
                    <WorkDatePickerField
                      id={field.name}
                      value={field.state.value}
                      onChange={field.handleChange}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field
                name="completed_at"
                validators={{
                  onChangeListenTo: ['started_at'],
                  onChange: ({ value, fieldApi }) => {
                    const startedAt = fieldApi.form.getFieldValue('started_at')
                    if (!value || !startedAt) return undefined
                    return new Date(value) < new Date(startedAt)
                      ? { message: t('work.fields.completedBeforeStarted') }
                      : undefined
                  },
                }}
              >
                {(field) => {
                  const isInvalid = !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {t('work.fields.completedAt')}
                      </FieldLabel>
                      <WorkDatePickerField
                        id={field.name}
                        value={field.state.value}
                        onChange={field.handleChange}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>
            </div>

            {isEdit && (
              <form.Field name="rating">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      {t('work.fields.rating')}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      min={0}
                      max={5}
                      value={field.state.value ?? ''}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value === '' ? null : Number(e.target.value),
                        )
                      }
                    />
                  </Field>
                )}
              </form.Field>
            )}

            <form.Field
              name="external_url"
              validators={{
                onBlur: z.string().url(t('work.fields.linkInvalid')).nullable(),
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('work.fields.link')}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="url"
                      value={field.state.value ?? ''}
                      onBlur={() => {
                        field.handleBlur()
                        if (
                          isEdit ||
                          !field.state.value ||
                          form.getFieldValue('image_url')
                        ) {
                          return
                        }
                        autoOgImage.mutate({ pageUrl: field.state.value })
                      }}
                      onChange={(e) =>
                        field.handleChange(e.target.value || null)
                      }
                      aria-invalid={isInvalid}
                      placeholder="https://…"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            {isEdit && (
              <form.Field name="summary">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      {t('work.fields.notes')}
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      value={field.state.value ?? ''}
                      onChange={(e) =>
                        field.handleChange(e.target.value || null)
                      }
                      rows={2}
                    />
                  </Field>
                )}
              </form.Field>
            )}

            <DialogFooter>
              <Button
                type="submit"
                disabled={createWork.isPending || updateWork.isPending}
              >
                {isEdit ? t('work.dialog.saveChanges') : workFormNewTitle(type)}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
