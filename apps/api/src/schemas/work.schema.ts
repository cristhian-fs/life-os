import { WorkStatus, WorkType } from "@/db/entities/work.entity";
import { z } from "zod";

// Common Fields
const BaseWorkSchema = z
  .object({
    title: z.string().min(1),
    creator: z.string(),
    status: z.enum(WorkStatus).default(WorkStatus.TO_CONSUME),
    external_url: z.url().nullable().optional(),
    image_url: z.url().nullable().optional(),
    started_at: z.string().nullable().optional(),
    completed_at: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.started_at && data.completed_at) {
      const start = new Date(data.started_at);
      const end = new Date(data.completed_at);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        if (start > end) {
          ctx.addIssue({
            code: "custom",
            message: "Completed At can't be smaller than started at",
            path: ["completed_at"],
          });
        }
      }
    }
  });

const CreateBookWorkSchema = BaseWorkSchema.extend({
  type: z.literal(WorkType.BOOK),
  detail: z.object({
    isbn: z.string().nullable().optional(),
    pages: z.number().int().positive().nullable().optional(),
    publisher: z.string().nullable().optional(),
  }),
});

const CreateMovieWorkSchema = BaseWorkSchema.extend({
  type: z.literal(WorkType.MOVIE),
  detail: z.object({
    runtime_minutes: z.number().int().positive().nullable().optional(),
    director: z.string().nullable().optional(),
  }),
});

const CreateArticleWorkSchema = BaseWorkSchema.extend({
  type: z.literal(WorkType.ARTICLE),
  detail: z.object({
    source_name: z.string().nullable().optional(),
    reading_time_minutes: z.number().int().positive().nullable().optional(),
    published_at: z.string().datetime().nullable().optional(),
  }),
});

const CreateCourseWorkSchema = BaseWorkSchema.extend({
  type: z.literal(WorkType.COURSE),
  detail: z.object({
    platform: z.string().nullable().optional(),
    instructor: z.string().nullable().optional(),
    duration_hours: z.number().positive().nullable().optional(),
  }),
});

const CreateVideoWorkSchema = BaseWorkSchema.extend({
  type: z.literal(WorkType.VIDEO),
  detail: z.object({
    platform: z.string().nullable().optional(),
    duration_minutes: z.number().int().positive().nullable().optional(),
  }),
});

export const CreateWorkSchema = z.discriminatedUnion("type", [
  CreateBookWorkSchema,
  CreateMovieWorkSchema,
  CreateArticleWorkSchema,
  CreateCourseWorkSchema,
  CreateVideoWorkSchema,
]);

export type CreateWorkInput = z.infer<typeof CreateWorkSchema>;

// Flat bag of every type's detail fields, all optional — a work's type can't
// change on update, so unlike CreateWorkSchema this isn't a discriminated
// union; the use-case picks the fields relevant to the work's existing type
// and ignores the rest.
const UpdateDetailSchema = z.object({
  isbn: z.string().nullable().optional(),
  pages: z.number().int().positive().nullable().optional(),
  publisher: z.string().nullable().optional(),
  runtime_minutes: z.number().int().positive().nullable().optional(),
  director: z.string().nullable().optional(),
  source_name: z.string().nullable().optional(),
  reading_time_minutes: z.number().int().positive().nullable().optional(),
  published_at: z.string().datetime().nullable().optional(),
  platform: z.string().nullable().optional(),
  instructor: z.string().nullable().optional(),
  duration_hours: z.number().positive().nullable().optional(),
  duration_minutes: z.number().int().positive().nullable().optional(),
});

export type UpdateDetailInput = z.infer<typeof UpdateDetailSchema>;

// No `type` field here on purpose — a work item's type can't be edited after creation.
export const UpdateWorkSchema = z.object({
  title: z.string().min(1).optional(),
  creator: z.string().optional(),
  status: z.enum(WorkStatus).optional(),
  rating: z.number().int().min(0).max(5).nullable().optional(),
  started_at: z.string().datetime().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
  summary: z.string().nullable().optional(),
  external_url: z.url().nullable().optional(),
  image_url: z.url().nullable().optional(),
  detail: UpdateDetailSchema.optional(),
});

export type UpdateWorkInput = z.infer<typeof UpdateWorkSchema>;

const BookDetailResponseSchema = z.object({
  isbn: z.string().nullable(),
  pages: z.number().nullable(),
  publisher: z.string().nullable(),
});

const MovieDetailResponseSchema = z.object({
  runtime_minutes: z.number().nullable(),
  director: z.string().nullable(),
});

const ArticleDetailResponseSchema = z.object({
  source_name: z.string(),
  reading_time_minutes: z.number().nullable(),
  published_at: z.string().datetime().nullable(),
});

const CourseDetailResponseSchema = z.object({
  platform: z.string().nullable(),
  instructor: z.string().nullable(),
  duration_hours: z.number().nullable(),
});

const VideoDetailResponseSchema = z.object({
  platform: z.string().nullable(),
  duration_minutes: z.number().nullable(),
});

export const WorkResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  type: z.enum(WorkType),
  title: z.string(),
  creator: z.string(),
  status: z.enum(WorkStatus),
  rating: z.number().nullable(),
  started_at: z.string().datetime().nullable(),
  completed_at: z.string().datetime().nullable(),
  summary: z.string().nullable(),
  external_url: z.string().nullable(),
  image_url: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  detail: z
    .union([
      BookDetailResponseSchema,
      MovieDetailResponseSchema,
      ArticleDetailResponseSchema,
      CourseDetailResponseSchema,
      VideoDetailResponseSchema,
    ])
    .nullable(),
});

export type WorkResponse = z.infer<typeof WorkResponseSchema>;

export const DeleteWorkResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
