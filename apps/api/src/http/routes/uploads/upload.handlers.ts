import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "@/lib/types";
import { R2Storage } from "@/storage/r2-storage";
import { UploadImageUseCase } from "@/use-cases/upload-image";
import type { UploadImageRoute } from "./upload.routes";

export const uploadImage: AppRouteHandler<UploadImageRoute> = async (c) => {
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

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
