import { useCreatePurchaseWishlist } from '#/features/purchase-wishlist/api/create-purchase-wishlist'
import { useUpdatePurchaseWishlist } from '#/features/purchase-wishlist/api/update-purchase-wishlist'
import { MoneyInput } from '#/features/purchase-wishlist/components/money-input'
import { CURRENCY_PRESETS } from '#/features/purchase-wishlist/lib/currency'
import { linkableWorks } from '#/features/purchase-wishlist/lib/linkable-works'
import { useWorks } from '#/features/works/api/get-works'
import { workTypeLabel } from '#/features/works/lib/format'
import type { PurchaseWishlist } from '#/types/api'
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
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import * as z from 'zod'

const NO_WORK = 'none'

type PurchaseWishlistFormDialogProps = {
  trigger?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  item?: PurchaseWishlist
}

export function PurchaseWishlistFormDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
  item,
}: PurchaseWishlistFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const isEdit = !!item
  const works = useWorks()
  const candidates = linkableWorks(works.data ?? [], item?.work_id ?? null)

  const createItem = useCreatePurchaseWishlist({
    mutationConfig: {
      onSuccess: () => {
        toast.add({ title: 'Added to wishlist', type: 'success' })
        setOpen(false)
      },
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })
  const updateItem = useUpdatePurchaseWishlist({
    mutationConfig: {
      onSuccess: () => {
        toast.add({ title: 'Wishlist item updated', type: 'success' })
        setOpen(false)
      },
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })

  const form = useForm({
    defaultValues: {
      title: item?.title ?? '',
      store_or_url: item?.store_or_url ?? '',
      currency: item?.currency ?? 'USD',
      estimated_price_in_cents: item?.estimated_price_in_cents ?? null,
      work_id: item?.work_id ?? null,
    },
    onSubmit: async ({ value }) => {
      const data = {
        title: value.title || null,
        store_or_url: value.store_or_url,
        currency: value.currency,
        estimated_price_in_cents: value.estimated_price_in_cents,
        work_id: value.work_id,
      }
      if (isEdit) {
        updateItem.mutate({ id: item.id, data })
      } else {
        createItem.mutate({ data })
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit item' : 'New wishlist item'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the store, title, price, or linked work.'
              : "Add something you're planning to buy."}
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
              name="store_or_url"
              validators={{ onBlur: z.string().min(1, 'Required') }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Store or URL
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

            <form.Field name="work_id">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Linked work (optional)
                  </FieldLabel>
                  <Select
                    value={field.state.value ?? NO_WORK}
                    onValueChange={(v) =>
                      field.handleChange(v === NO_WORK ? null : v)
                    }
                    disabled={works.isLoading}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue>
                        {(value: string) => {
                          const work = candidates.find((w) => w.id === value)
                          return work
                            ? `${work.title} · ${workTypeLabel[work.type]}`
                            : 'No work linked'
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_WORK}>No work linked</SelectItem>
                      {candidates.map((work) => (
                        <SelectItem key={work.id} value={work.id}>
                          {work.title} · {workTypeLabel[work.type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <form.Field name="title">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Title (optional)
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.Field>

            <div className="flex gap-3">
              <form.Field name="currency">
                {(field) => (
                  <Field className="w-28 shrink-0">
                    <FieldLabel htmlFor={field.name}>Currency</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v as string)}
                    >
                      <SelectTrigger id={field.name} className="w-full">
                        <SelectValue>{(value: string) => value}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_PRESETS.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>

              <form.Field name="estimated_price_in_cents">
                {(field) => (
                  <Field className="flex-1">
                    <FieldLabel htmlFor={field.name}>
                      Estimated price (optional)
                    </FieldLabel>
                    <form.Subscribe selector={(state) => state.values.currency}>
                      {(currency) => (
                        <MoneyInput
                          id={field.name}
                          cents={field.state.value}
                          currency={currency}
                          onChange={field.handleChange}
                        />
                      )}
                    </form.Subscribe>
                  </Field>
                )}
              </form.Field>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={createItem.isPending || updateItem.isPending}
              >
                {isEdit ? 'Save changes' : 'Add item'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
