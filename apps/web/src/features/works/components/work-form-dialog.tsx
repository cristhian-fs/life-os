import { useCreateWork } from '#/features/works/api/create-work'
import type { CreateWorkInput } from '#/features/works/api/create-work'
import { useUpdateWork } from '#/features/works/api/update-work'
import { workStatusLabel, workTypeLabel } from '#/features/works/lib/format'
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
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import * as z from 'zod'
import { WorkImageField } from './work-image-field'

type WorkFormDialogProps = {
  // Provide `trigger` for an uncontrolled dialog (e.g. the page-level "New
  // book" button). Omit it and pass `open`/`onOpenChange` instead when
  // opening from elsewhere (e.g. a dropdown menu item).
  trigger?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Fixed by the page this dialog is used on — a work's type can't change after creation. */
  type: WorkType
  work?: Work
}

// One flat `detail` bag carrying every type's fields — only the ones for
// `type` are rendered/sent. The unused ones get stripped by zod at
// validate/submit time, so one form covers all 4 types instead of one per type.
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
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const isEdit = !!work
  const typeLabel = workTypeLabel[type]

  const createWork = useCreateWork({
    mutationConfig: {
      onSuccess: () => {
        toast.add({ title: `${typeLabel} added`, type: 'success' })
        setOpen(false)
      },
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })
  const updateWork = useUpdateWork({
    mutationConfig: {
      onSuccess: () => {
        toast.add({ title: `${typeLabel} updated`, type: 'success' })
        setOpen(false)
      },
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
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
          (detail &&
            'duration_minutes' in detail &&
            detail.duration_minutes) ||
          null,
      } satisfies DetailValues,
    },
    // Create/edit have differently-shaped valid payloads (detail fields only
    // exist on create; rating/summary only on edit), so validation happens
    // per-field below instead of one form-level schema — the createWorkSchema/
    // updateWorkSchema exports stay the pure request-shape source of truth
    // for the API call itself (see api/create-work.ts, api/update-work.ts).
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
            image_url: value.image_url,
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
            {isEdit
              ? `Edit ${typeLabel.toLowerCase()}`
              : `New ${typeLabel.toLowerCase()}`}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update status, rating, or notes.'
              : `Add a ${typeLabel.toLowerCase()} to your vault.`}
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
              validators={{ onBlur: z.string().min(1, 'Title required') }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Title</FieldLabel>
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
                  <FieldLabel>Cover image</FieldLabel>
                  <WorkImageField
                    value={field.state.value}
                    onChange={field.handleChange}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field
              name="creator"
              validators={{ onBlur: z.string().min(1, 'Required') }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {type === WorkType.MOVIE
                        ? 'Director'
                        : type === WorkType.COURSE
                          ? 'Instructor'
                          : type === WorkType.VIDEO
                            ? 'Creator'
                            : 'Author'}
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

            {!isEdit && type === WorkType.BOOK && (
              <div className="flex gap-3">
                <form.Field name="detail.publisher">
                  {(field) => (
                    <Field className="flex-1">
                      <FieldLabel htmlFor={field.name}>Publisher</FieldLabel>
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
                      <FieldLabel htmlFor={field.name}>Pages</FieldLabel>
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

            {!isEdit && type === WorkType.MOVIE && (
              <form.Field name="detail.runtime_minutes">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Runtime (minutes)
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

            {!isEdit && type === WorkType.ARTICLE && (
              <div className="flex gap-3">
                <form.Field
                  name="detail.source_name"
                  validators={{ onBlur: z.string().min(1, 'Source required') }}
                >
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid} className="flex-1">
                        <FieldLabel htmlFor={field.name}>Source</FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="e.g. The Atlantic"
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
                      <FieldLabel htmlFor={field.name}>Reading time</FieldLabel>
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

            {!isEdit && type === WorkType.COURSE && (
              <div className="flex gap-3">
                <form.Field name="detail.platform">
                  {(field) => (
                    <Field className="flex-1">
                      <FieldLabel htmlFor={field.name}>Platform</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value ?? ''}
                        onChange={(e) =>
                          field.handleChange(e.target.value || null)
                        }
                        placeholder="e.g. Coursera"
                      />
                    </Field>
                  )}
                </form.Field>
                <form.Field name="detail.duration_hours">
                  {(field) => (
                    <Field className="flex-1">
                      <FieldLabel htmlFor={field.name}>
                        Duration (hours)
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

            {!isEdit && type === WorkType.VIDEO && (
              <div className="flex gap-3">
                <form.Field name="detail.platform">
                  {(field) => (
                    <Field className="flex-1">
                      <FieldLabel htmlFor={field.name}>Platform</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value ?? ''}
                        onChange={(e) =>
                          field.handleChange(e.target.value || null)
                        }
                        placeholder="e.g. YouTube"
                      />
                    </Field>
                  )}
                </form.Field>
                <form.Field name="detail.duration_minutes">
                  {(field) => (
                    <Field className="flex-1">
                      <FieldLabel htmlFor={field.name}>
                        Duration (minutes)
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
                  <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v as WorkStatus)}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue>
                        {(value: WorkStatus) => workStatusLabel[value]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(WorkStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {workStatusLabel[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            {isEdit && (
              <form.Field name="rating">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Rating (0-5)</FieldLabel>
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
                onBlur: z.string().url('Must be a valid URL').nullable(),
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Link</FieldLabel>
                    <Input
                      id={field.name}
                      type="url"
                      value={field.state.value ?? ''}
                      onBlur={field.handleBlur}
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
                    <FieldLabel htmlFor={field.name}>Notes</FieldLabel>
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
                {isEdit ? 'Save changes' : `Add ${typeLabel.toLowerCase()}`}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
