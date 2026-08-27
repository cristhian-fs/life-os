import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import env from "@life-os/env";
import type { UploadParams, Uploader } from "@/storage/uploader";

// Bucket must be public-read for these URLs to actually resolve — see docker/README setup.
const publicBaseUrl =
  env.AWS_PUBLIC_URL ?? `${env.AWS_ENDPOINT}/${env.AWS_BUCKET_NAME}`;

export class R2Storage implements Uploader {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      endpoint: env.AWS_ENDPOINT,
      region: "auto",
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async upload(params: UploadParams): Promise<{ url: string }> {
    const uniqueFileName = `${randomUUID()}-${params.fileName}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: uniqueFileName,
        ContentType: params.fileType,
        Body: params.body,
      }),
    );

    return {
      url: `${publicBaseUrl}/${uniqueFileName}`,
    };
  }
}
