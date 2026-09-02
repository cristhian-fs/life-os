import * as z from 'zod'
import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authClient } from '#/lib/auth-client'
import { toast } from '#/components/ui/toast'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const { t } = useTranslation()
  // Rebuilt every render (not module-level) so its messages stay in the
  // current language — a schema built once at import time would freeze
  // its error strings at whichever language was active on first load.
  const formSchema = z.object({
    email: z.email(t('auth.emailInvalid')),
    password: z.string().min(1, { message: t('auth.login.passwordRequired') }),
  })

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
          callbackURL: '/dashboard',
        },
        {
          onSuccess: () => {
            toast.add({
              title: t('auth.login.loggedInToast'),
              type: 'success',
            })
          },
          onError(context) {
            toast.add({
              title: context.error.message,
              type: 'error',
            })
          },
        },
      )
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className={cn('flex flex-col gap-6', className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{t('auth.login.title')}</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {t('auth.login.subtitle')}
          </p>
        </div>
        <form.Field
          name="email"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  {t('auth.fields.email')}
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  type="email"
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder={t('auth.login.emailPlaceholder')}
                  autoComplete="email"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="password"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <div className="flex items-center">
                  <FieldLabel htmlFor={field.name}>
                    {t('auth.fields.password')}
                  </FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-xs underline-offset-4 hover:underline"
                  >
                    {t('auth.login.forgotPassword')}
                  </a>
                </div>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  type="password"
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  autoComplete="current-password"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <Field>
          <Button type="submit">{t('auth.login.submit')}</Button>
        </Field>
        <FieldSeparator />
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {t('auth.login.noAccount')}
          </span>
          <Button
            variant="secondary"
            size="sm"
            render={<Link to="/register" />}
          >
            {t('auth.login.registerLink')}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
