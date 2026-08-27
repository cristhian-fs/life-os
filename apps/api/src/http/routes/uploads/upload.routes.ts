import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import {
  UploadImageResponseSchema,
  UploadImageSchema,
} from "@/schemas/upload.schema";

const tags = ["Uploads"];

export const uploadImage = createRoute({
  tags,
  method: "post",
  path: "/uploads/images",
  summary: "Upload an image file",
  request: {
    body: {
      required: true,
      content: {
        "multipart/form-data": { schema: UploadImageSchema },
      },
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      UploadImageResponseSchema,
      "Image uploaded",
    ),
  },
});

export type UploadImageRoute = typeof uploadImage;
