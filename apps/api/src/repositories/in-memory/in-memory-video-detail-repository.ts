import type { VideoDetail } from "@/db/entities/video-detail.entity";
import type {
  CreateVideoDetailInput,
  VideoDetailRepository,
} from "@/repositories/video-detail-repository";

export class InMemoryVideoDetailRepository implements VideoDetailRepository {
  public items: VideoDetail[] = [];

  async create(data: CreateVideoDetailInput): Promise<VideoDetail> {
    const videoDetail: VideoDetail = {
      work_id: data.work_id,
      platform: data.platform ?? null,
      duration_minutes: data.duration_minutes ?? null,
    } as VideoDetail;

    this.items.push(videoDetail);
    return videoDetail;
  }

  async findByWorkId(workId: string): Promise<VideoDetail | null> {
    return this.items.find((item) => item.work_id === workId) ?? null;
  }

  async save(videoDetail: VideoDetail): Promise<VideoDetail> {
    const index = this.items.findIndex(
      (item) => item.work_id === videoDetail.work_id,
    );

    if (index === -1)
      throw new Error(
        `Cannot save video detail ${videoDetail.work_id}: not found in repository`,
      );

    this.items[index] = videoDetail;
    return videoDetail;
  }
}
