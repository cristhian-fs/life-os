import { fetchOgImage } from "@/lib/utils";
import { MAX_FILE_SIZE_BYTES } from "@/schemas/upload.schema";
import type { Uploader } from "@/storage/uploader";

interface FetchOgImageUseCaseRequest {
  pageUrl: string;
}

interface FetchOgImageUseCaseResponse {
  url: string | null;
}

export class FetchOgImageUseCase {
  constructor(private uploader: Uploader) {}

  async execute({
    pageUrl,
  }: FetchOgImageUseCaseRequest): Promise<FetchOgImageUseCaseResponse> {
    const imageUrl = await fetchOgImage(pageUrl);
    if (!imageUrl) return { url: null };

    const res = await fetch(new URL(imageUrl, pageUrl));
    if (!res.ok) return { url: null };

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return { url: null };

    const body = Buffer.from(await res.arrayBuffer());
    if (body.byteLength > MAX_FILE_SIZE_BYTES) return { url: null };

    const { url } = await this.uploader.upload({
      fileName: "og-image.jpg",
      fileType: contentType,
      body,
    });

    return { url };
  }
}
