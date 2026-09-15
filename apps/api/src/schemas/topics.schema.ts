import { z } from "@hono/zod-openapi";
import { TopicStatus } from "@/db/entities/topic.entity";

export const TopicsResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  parent_topic_id: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  body: z.string().nullable(),
  status: z.enum(TopicStatus),
  order_index: z.number().nullable(),
  work_id: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type TopicResponse = z.infer<typeof TopicsResponseSchema>;

export const DeleteTopicResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const CreateTopicSchema = TopicsResponseSchema.pick({
  title: true,
  description: true,
  body: true,
  parent_topic_id: true,
  order_index: true,
  work_id: true,
});

export const UpdateTopicSchema = TopicsResponseSchema.pick({
  title: true,
  description: true,
  body: true,
  status: true,
  order_index: true,
  parent_topic_id: true,
  work_id: true,
}).partial();

export type UpdateTopicInput = z.infer<typeof UpdateTopicSchema>;

export type TopicTreeResponse = TopicResponse & { children: TopicTreeResponse[] };

// z.lazy + .openapi('TopicTree') is required here, not just style: without a
// registered ref id, zod-to-openapi expands a self-referencing schema forever
// instead of emitting a $ref, and the /doc route blows the stack generating it.
export const TopicTreeResponseSchema: z.ZodType<TopicTreeResponse> = z.lazy(
  () =>
    TopicsResponseSchema.extend({
      children: z.array(TopicTreeResponseSchema),
    }),
).openapi("TopicTree");
