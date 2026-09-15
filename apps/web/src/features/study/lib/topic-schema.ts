import * as z from 'zod'

/** Mirrors the API's CreateTopicSchema fields the form actually edits — parent_topic_id is set by the caller (which row's "add subtopic" was used), not a form field. */
export const topicFieldsSchema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().nullable(),
})

export type TopicFields = z.infer<typeof topicFieldsSchema>
