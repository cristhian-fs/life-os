import type { Uploader } from "@/storage/uploader";

interface UploadImageUseCaseRequest {
  fileName: string;
  fileType: string;
  body: Buffer;
}

interface UploadImageUseCaseResponse {
  url: string;
}

export class UploadImageUseCase {
  constructor(private uploader: Uploader) {}

  async execute({
    fileName,
    fileType,
    body,
  }: UploadImageUseCaseRequest): Promise<UploadImageUseCaseResponse> {
    return this.uploader.upload({ fileName, fileType, body });
  }
}
