import { z } from "@hono/zod-openapi";

const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const UploadImageSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "File must be an image (png, jpeg, webp, or gif)",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE_BYTES, {
      message: "File must be 5MB or smaller",
    })
    .openapi({ type: "string", format: "binary" }),
});

export const UploadImageResponseSchema = z.object({ url: z.url() });
export type UploadImageResponse = z.infer<typeof UploadImageResponseSchema>;

export const FetchOgImageSchema = z.object({ pageUrl: z.url() });

export const FetchOgImageResponseSchema = z.object({ url: z.url().nullable() });
export type FetchOgImageResponse = z.infer<typeof FetchOgImageResponseSchema>;
