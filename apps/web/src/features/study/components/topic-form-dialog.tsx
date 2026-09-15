import { useCreateTopic } from '#/features/study/api/create-topic'
import { useUpdateTopic } from '#/features/study/api/update-topic'
import { topicFieldsSchema } from '#/features/study/lib/topic-schema'
import type { Topic } from '#/types/api'
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from '#/components/ui/toast'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type TopicFormDialogProps = {
  // Provide `trigger` for an uncontrolled dialog (e.g. a page-level "New
  // topic" button). Omit it and pass `open`/`onOpenChange` instead when
  // opening from elsewhere (e.g. a dropdown menu item).
  trigger?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  topic?: Topic
  /** Set when creating a subtopic under this topic; ignored while editing. */
  parentTopicId?: string | null
}

export function TopicFormDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
  topic,
  parentTopicId = null,
}: TopicFormDialogProps) {
  const { t } = useTranslation()
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const isEdit = !!topic

  const createTopic = useCreateTopic({
    mutationConfig: {
      onSuccess: () => {
        toast.add({ title: t('study.form.created'), type: 'success' })
        setOpen(false)
      },
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })
  const updateTopic = useUpdateTopic({
    mutationConfig: {
      onSuccess: () => {
        toast.add({ title: t('study.form.updated'), type: 'success' })
        setOpen(false)
      },
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })

  const form = useForm({
    defaultValues: {
      title: topic?.title ?? '',
      description: topic?.description ?? null,
    },
    validators: { onSubmit: topicFieldsSchema },
    onSubmit: async ({ value }) => {
      if (isEdit) {
        updateTopic.mutate({ id: topic.id, data: value })
      } else {
        createTopic.mutate({
          data: { ...value, parent_topic_id: parentTopicId },
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
            {isEdit ? t('study.form.editTitle') : t('study.form.newTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('study.form.editDescription')
              : t('study.form.newDescription')}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field name="title">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('study.form.titleLabel')}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder={t('study.form.titlePlaceholder')}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    {t('study.form.descriptionLabel')}
                  </FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value || null)}
                    placeholder={t('study.form.descriptionPlaceholder')}
                    rows={2}
                  />
                </Field>
              )}
            </form.Field>

            <DialogFooter>
              <Button
                type="submit"
                disabled={createTopic.isPending || updateTopic.isPending}
              >
                {isEdit
                  ? t('study.form.saveChanges')
                  : t('study.form.createTopic')}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
