import { useCreateHabit } from '#/features/habits/api/create-habit'
import { useUpdateHabit } from '#/features/habits/api/update-habit'
import { goalPeriodLabel } from '#/features/habits/lib/format'
import { habitSchema } from '#/features/habits/lib/habit-schema'
import { HabitGoalPeriod, HabitType } from '#/types/api'
import type { Habit } from '#/types/api'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '#/components/ui/toast'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type HabitFormDialogProps = {
  // Provide `trigger` for an uncontrolled dialog (e.g. the page-level "New
  // habit" button). Omit it and pass `open`/`onOpenChange` instead when
  // opening from elsewhere (e.g. a dropdown menu item) — nesting a
  // DialogTrigger inside a menu item causes focus/portal stacking issues.
  trigger?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  habit?: Habit
}

export function HabitFormDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
  habit,
}: HabitFormDialogProps) {
  const { t } = useTranslation()
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const isEdit = !!habit

  const createHabit = useCreateHabit({
    mutationConfig: {
      onSuccess: () => {
        toast.add({ title: t('habits.form.created'), type: 'success' })
        setOpen(false)
      },
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })
  const updateHabit = useUpdateHabit({
    mutationConfig: {
      onSuccess: () => {
        toast.add({ title: t('habits.form.updated'), type: 'success' })
        setOpen(false)
      },
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })

  const form = useForm({
    defaultValues: {
      name: habit?.name ?? '',
      description: habit?.description ?? '',
      type: habit?.type ?? HabitType.BOOLEAN,
      unit: habit?.unit ?? null,
      goal_value: habit?.goal_value ?? null,
      goal_period: habit?.goal_period ?? HabitGoalPeriod.DAILY,
    },
    validators: { onSubmit: habitSchema },
    onSubmit: async ({ value }) => {
      if (isEdit) {
        updateHabit.mutate({
          id: habit.id,
          data: {
            name: value.name,
            description: value.description,
            goal_value: value.goal_value,
            goal_period: value.goal_period,
          },
        })
      } else {
        createHabit.mutate({
          data: {
            name: value.name,
            description: value.description,
            type: value.type,
            unit: value.unit,
            goal_value: value.goal_value,
            goal_period: value.goal_period,
          },
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
            {isEdit ? t('habits.form.editTitle') : t('habits.form.newTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('habits.form.editDescription')
              : t('habits.form.newDescription')}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('habits.form.name')}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder={t('habits.form.namePlaceholder')}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="description">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('habits.form.description')}
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder={t('habits.form.descriptionPlaceholder')}
                      rows={2}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="type">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    {t('habits.form.type')}
                  </FieldLabel>
                  {isEdit ? (
                    <p className="text-xs text-muted-foreground">
                      {field.state.value === HabitType.NUMERIC
                        ? t('habits.form.typeNumericLocked')
                        : t('habits.form.typeBooleanLocked')}
                    </p>
                  ) : (
                    <RadioGroup
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v as HabitType)}
                      className="grid-flow-col"
                    >
                      <FieldLabel className="flex-row items-center gap-2 text-xs font-normal">
                        <RadioGroupItem value={HabitType.BOOLEAN} />
                        {t('habits.form.typeBooleanOption')}
                      </FieldLabel>
                      <FieldLabel className="flex-row items-center gap-2 text-xs font-normal">
                        <RadioGroupItem value={HabitType.NUMERIC} />
                        {t('habits.form.typeNumericOption')}
                      </FieldLabel>
                    </RadioGroup>
                  )}
                </Field>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.values.type}>
              {(type) =>
                type === HabitType.NUMERIC && (
                  <div className="flex gap-3">
                    <form.Field name="goal_value">
                      {(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid} className="flex-1">
                            <FieldLabel htmlFor={field.name}>
                              {t('habits.form.goal')}
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              type="number"
                              value={field.state.value ?? ''}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(
                                  e.target.value === ''
                                    ? null
                                    : Number(e.target.value),
                                )
                              }
                              aria-invalid={isInvalid}
                              placeholder={t('habits.form.goalPlaceholder')}
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    </form.Field>
                    <form.Field name="unit">
                      {(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid} className="flex-1">
                            <FieldLabel htmlFor={field.name}>
                              {t('habits.form.unit')}
                            </FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value ?? ''}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              disabled={isEdit}
                              placeholder={t('habits.form.unitPlaceholder')}
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    </form.Field>
                  </div>
                )
              }
            </form.Subscribe>

            <form.Field name="goal_period">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    {t('habits.form.frequency')}
                  </FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) =>
                      field.handleChange(v as HabitGoalPeriod)
                    }
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue>
                        {(value: HabitGoalPeriod) => goalPeriodLabel(value)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(HabitGoalPeriod).map((period) => (
                        <SelectItem key={period} value={period}>
                          {goalPeriodLabel(period)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <DialogFooter>
              <Button
                type="submit"
                disabled={createHabit.isPending || updateHabit.isPending}
              >
                {isEdit
                  ? t('habits.form.saveChanges')
                  : t('habits.form.createHabit')}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
