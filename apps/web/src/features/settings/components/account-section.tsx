import { ProfilePictureField } from '#/features/settings/components/profile-picture-field'
import { authClient } from '#/lib/auth-client'
import { queryClient } from '#/lib/react-query'
import { toast } from '#/components/ui/toast'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export function AccountSection({
  name,
  email,
  image,
}: {
  name: string
  email: string
  image: string | null | undefined
}) {
  const { t } = useTranslation()
  const [draftName, setDraftName] = useState(name)

  const commitName = async () => {
    const trimmed = draftName.trim()
    if (!trimmed || trimmed === name) {
      setDraftName(name)
      return
    }
    const { error } = await authClient.updateUser({ name: trimmed })
    if (error) {
      setDraftName(name)
      toast.add({ title: error.message, type: 'error' })
      return
    }
    await queryClient.invalidateQueries({ queryKey: ['session'] })
    toast.add({
      title: t('settings.account.nameUpdatedToast'),
      type: 'success',
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">{t('settings.account.heading')}</h3>
      <ProfilePictureField name={name} image={image} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="full-name">
            {t('settings.account.fullName')}
          </FieldLabel>
          <Input
            id="full-name"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitName}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">{t('settings.account.email')}</FieldLabel>
          <Input id="email" value={email} disabled />
        </Field>
      </FieldGroup>
    </div>
  )
}
