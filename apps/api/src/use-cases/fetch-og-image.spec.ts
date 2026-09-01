import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Uploader } from "@/storage/uploader";
import { FetchOgImageUseCase } from "./fetch-og-image";

class FakeUploader implements Uploader {
  public uploaded: { fileName: string; fileType: string }[] = [];

  async upload({
    fileName,
    fileType,
  }: {
    fileName: string;
    fileType: string;
  }) {
    this.uploaded.push({ fileName, fileType });
    return { url: `https://r2.example.com/${fileName}` };
  }
}

function htmlResponse(html: string) {
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html" },
  });
}

function imageResponse(bytes: string, contentType = "image/jpeg") {
  return new Response(bytes, {
    status: 200,
    headers: { "content-type": contentType },
  });
}

let uploader: FakeUploader;
let sut: FetchOgImageUseCase;

describe("Fetch Og Image Use Case", () => {
  beforeEach(() => {
    uploader = new FakeUploader();
    sut = new FetchOgImageUseCase(uploader);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches the page's og:image and uploads it", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        htmlResponse(
          '<meta property="og:image" content="https://cdn.example.com/cover.jpg">',
        ),
      )
      .mockResolvedValueOnce(imageResponse("fake-image-bytes"));
    vi.stubGlobal("fetch", fetchMock);

    const { url } = await sut.execute({ pageUrl: "https://example.com/book" });

    expect(url).toBe("https://r2.example.com/og-image.jpg");
    expect(uploader.uploaded).toEqual([
      { fileName: "og-image.jpg", fileType: "image/jpeg" },
    ]);
  });

  it("returns null when the page has no og:image", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(htmlResponse("<html></html>")),
    );

    const { url } = await sut.execute({ pageUrl: "https://example.com/book" });

    expect(url).toBeNull();
    expect(uploader.uploaded).toHaveLength(0);
  });

  it("returns null when the og:image URL doesn't resolve to an image", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        htmlResponse(
          '<meta property="og:image" content="https://cdn.example.com/cover.jpg">',
        ),
      )
      .mockResolvedValueOnce(
        new Response("not found", { status: 404 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { url } = await sut.execute({ pageUrl: "https://example.com/book" });

    expect(url).toBeNull();
    expect(uploader.uploaded).toHaveLength(0);
  });

  it("returns null when the fetched content isn't an image", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        htmlResponse(
          '<meta property="og:image" content="https://cdn.example.com/cover.pdf">',
        ),
      )
      .mockResolvedValueOnce(
        new Response("%PDF-1.4", {
          status: 200,
          headers: { "content-type": "application/pdf" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { url } = await sut.execute({ pageUrl: "https://example.com/book" });

    expect(url).toBeNull();
    expect(uploader.uploaded).toHaveLength(0);
  });
});
