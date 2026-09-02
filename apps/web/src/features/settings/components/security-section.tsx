import { authClient } from '#/lib/auth-client'
import { toast } from '#/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

function PasswordField({
  id,
  label,
  value,
  onChange,
  onBlur,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  autoComplete: string
}) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          className="pe-9"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={
            visible
              ? t('settings.security.hidePassword')
              : t('settings.security.showPassword')
          }
          className="absolute inset-y-0 end-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-e-md"
        >
          {visible ? <EyeSlashIcon /> : <EyeIcon />}
        </button>
      </div>
    </Field>
  )
}

export function SecuritySection() {
  const { t } = useTranslation()

  const formSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, t('settings.security.passwordHint')),
  })

  const form = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
      })
      if (error) {
        toast.add({ title: error.message, type: 'error' })
        return
      }
      toast.add({
        title: t('settings.security.passwordUpdatedToast'),
        type: 'success',
      })
      form.reset()
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">
        {t('settings.security.heading')}
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldGroup>
          <form.Field name="currentPassword">
            {(field) => (
              <PasswordField
                id={field.name}
                label={t('settings.security.currentPassword')}
                value={field.state.value}
                onChange={field.handleChange}
                autoComplete="current-password"
              />
            )}
          </form.Field>
          <form.Field name="newPassword">
            {(field) => (
              <div className="flex flex-col gap-1">
                <PasswordField
                  id={field.name}
                  label={t('settings.security.newPassword')}
                  value={field.state.value}
                  onChange={field.handleChange}
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">
                  {t('settings.security.passwordHint')}
                </p>
              </div>
            )}
          </form.Field>
          <Field>
            <Button
              type="submit"
              className="w-fit"
              disabled={form.state.isSubmitting}
            >
              {t('settings.security.changePassword')}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
