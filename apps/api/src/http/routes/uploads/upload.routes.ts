import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import {
  FetchOgImageResponseSchema,
  FetchOgImageSchema,
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

// Fetches a page's og:image server-side (browsers can't — CORS) and
// re-hosts it on R2, same response shape as /uploads/images.
export const fetchOgImage = createRoute({
  tags,
  method: "post",
  path: "/uploads/og-image",
  summary: "Fetch a page's og:image and upload it",
  request: {
    body: {
      required: true,
      content: {
        "application/json": { schema: FetchOgImageSchema },
      },
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      FetchOgImageResponseSchema,
      "og:image fetched (url is null if none was found)",
    ),
  },
});

export type FetchOgImageRoute = typeof fetchOgImage;
