import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "@/lib/types";
import { R2Storage } from "@/storage/r2-storage";
import { FetchOgImageUseCase } from "@/use-cases/fetch-og-image";
import { UploadImageUseCase } from "@/use-cases/upload-image";
import type { FetchOgImageRoute, UploadImageRoute } from "./upload.routes";

function requireUser(c: { get: (key: "user") => unknown }) {
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  return user;
}

export const uploadImage: AppRouteHandler<UploadImageRoute> = async (c) => {
  requireUser(c);

  const { file } = c.req.valid("form");
  const body = Buffer.from(await file.arrayBuffer());

  const uploader = new R2Storage();
  const useCase = new UploadImageUseCase(uploader);

  const { url } = await useCase.execute({
    fileName: file.name,
    fileType: file.type,
    body,
  });

  return c.json({ url }, HttpStatusCodes.OK);
};

export const fetchOgImage: AppRouteHandler<FetchOgImageRoute> = async (c) => {
  requireUser(c);

  const { pageUrl } = c.req.valid("json");

  const uploader = new R2Storage();
  const useCase = new FetchOgImageUseCase(uploader);

  const { url } = await useCase.execute({ pageUrl });

  return c.json({ url }, HttpStatusCodes.OK);
};
