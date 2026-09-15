import { useUpdateTopic } from '#/features/study/api/update-topic'
import {
  topicStatusBadgeVariant,
  topicStatusDotColor,
  topicStatusLabel,
} from '#/features/study/lib/format'
import { TopicStatus } from '#/types/api'
import type { Topic } from '#/types/api'
import { toast } from '#/components/ui/toast'
import { QuickSelectPopover } from '@/components/quick-select-popover'
import type { QuickSelectOption } from '@/components/quick-select-popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

function useStatusOptions(): QuickSelectOption<TopicStatus>[] {
  useTranslation()
  return Object.values(TopicStatus).map((status) => ({
    value: status,
    label: topicStatusLabel(status),
    icon: (
      <span
        className={cn('size-2 rounded-full', topicStatusDotColor[status])}
      />
    ),
  }))
}

/** Status badge that opens a quick-select popover to change a topic's status. */
export function TopicStatusPopover({ topic }: { topic: Topic }) {
  const [open, setOpen] = useState(false)
  const statusOptions = useStatusOptions()

  const updateTopic = useUpdateTopic({
    mutationConfig: {
      onError: (error) => toast.add({ title: error.message, type: 'error' }),
    },
  })

  const handleSelect = (status: TopicStatus) => {
    setOpen(false)
    if (status === topic.status) return
    updateTopic.mutate({ id: topic.id, data: { status } })
  }

  return (
    <QuickSelectPopover
      trigger={
        <Badge
          variant={topicStatusBadgeVariant[topic.status]}
          className="cursor-pointer"
        >
          {topicStatusLabel(topic.status)}
        </Badge>
      }
      options={statusOptions}
      value={topic.status}
      onSelect={handleSelect}
      open={open}
      onOpenChange={setOpen}
    />
  )
}
