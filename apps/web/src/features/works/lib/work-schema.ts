import { WorkStatus, WorkType } from '#/types/api'
import * as z from 'zod'

/**
 * Mirrors the API's CreateWorkSchema (apps/api/src/schemas/work.schema.ts) —
 * a work's type fixes its detail shape and can't change after creation.
 * started_at/completed_at are here (not just on update) so a work can be
 * logged with dates in the past — e.g. a book finished last year, added
 * today. The API enforces completed_at >= started_at; the form mirrors that
 * check for immediate feedback (see work-form-dialog.tsx).
 */
const baseWorkFieldsSchema = z.object({
  title: z.string().min(1, 'Title required'),
  creator: z.string().min(1, 'Creator required'),
  status: z.enum(WorkStatus),
  external_url: z.url('Must be a valid URL').nullable(),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  // Upload via useUploadImage (POST /uploads/images) first, then pass the url it returns here.
  image_url: z.string().nullable(),
})

export const bookWorkSchema = baseWorkFieldsSchema.extend({
  type: z.literal(WorkType.BOOK),
  detail: z.object({
    isbn: z.string().nullable(),
    pages: z.number().int().positive().nullable(),
    publisher: z.string().nullable(),
  }),
})

export const movieWorkSchema = baseWorkFieldsSchema.extend({
  type: z.literal(WorkType.MOVIE),
  detail: z.object({
    runtime_minutes: z.number().int().positive().nullable(),
    director: z.string().nullable(),
  }),
})

export const articleWorkSchema = baseWorkFieldsSchema.extend({
  type: z.literal(WorkType.ARTICLE),
  detail: z.object({
    source_name: z.string().min(1, 'Source required'),
    reading_time_minutes: z.number().int().positive().nullable(),
    published_at: z.string().nullable(),
  }),
})

export const courseWorkSchema = baseWorkFieldsSchema.extend({
  type: z.literal(WorkType.COURSE),
  detail: z.object({
    platform: z.string().nullable(),
    instructor: z.string().nullable(),
    duration_hours: z.number().positive().nullable(),
  }),
})

export const videoWorkSchema = baseWorkFieldsSchema.extend({
  type: z.literal(WorkType.VIDEO),
  detail: z.object({
    platform: z.string().nullable(),
    duration_minutes: z.number().int().positive().nullable(),
  }),
})

export const createWorkSchema = z.discriminatedUnion('type', [
  bookWorkSchema,
  movieWorkSchema,
  articleWorkSchema,
  courseWorkSchema,
  videoWorkSchema,
])

export type CreateWorkFormValues = z.infer<typeof createWorkSchema>

/** Looked up by a fixed `type` prop so the form only validates that type's detail fields. */
export const workSchemaByType = {
  [WorkType.BOOK]: bookWorkSchema,
  [WorkType.MOVIE]: movieWorkSchema,
  [WorkType.ARTICLE]: articleWorkSchema,
  [WorkType.COURSE]: courseWorkSchema,
  [WorkType.VIDEO]: videoWorkSchema,
}

// Flat bag of every type's detail fields, all optional — mirrors the API's
// UpdateDetailSchema. A work's type can't change on update, so the form
// (which knows its fixed `type` prop) only ever fills in the relevant subset
// via detailForType(); the API drops whatever doesn't belong to the type.
const updateDetailSchema = z.object({
  isbn: z.string().nullable().optional(),
  pages: z.number().int().positive().nullable().optional(),
  publisher: z.string().nullable().optional(),
  runtime_minutes: z.number().int().positive().nullable().optional(),
  director: z.string().nullable().optional(),
  source_name: z.string().nullable().optional(),
  reading_time_minutes: z.number().int().positive().nullable().optional(),
  published_at: z.string().nullable().optional(),
  platform: z.string().nullable().optional(),
  instructor: z.string().nullable().optional(),
  duration_hours: z.number().positive().nullable().optional(),
  duration_minutes: z.number().int().positive().nullable().optional(),
})

// Mirrors the API's UpdateWorkSchema — every field optional, a real partial
// patch (the edit form submits all of them; quick actions like the status
// popover submit just one, e.g. `{ status }` or `{ rating }`).
export const updateWorkSchema = z.object({
  title: z.string().min(1, 'Title required').optional(),
  creator: z.string().min(1, 'Creator required').optional(),
  status: z.enum(WorkStatus).optional(),
  rating: z.number().int().min(0).max(5).nullable().optional(),
  started_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  external_url: z.url('Must be a valid URL').nullable().optional(),
  image_url: z.string().nullable().optional(),
  detail: updateDetailSchema.optional(),
})

export type UpdateWorkFormValues = z.infer<typeof updateWorkSchema>
