import type { DataSource, DeepPartial, Repository } from "typeorm";
import { VideoDetail } from "@/db/entities/video-detail.entity";
import type {
  CreateVideoDetailInput,
  VideoDetailRepository,
} from "@/repositories/video-detail-repository";

export class TypeORMVideoDetailRepository implements VideoDetailRepository {
  protected readonly repo: Repository<VideoDetail>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(VideoDetail);
  }
  async create(videoDetail: CreateVideoDetailInput): Promise<VideoDetail> {
    const data = await this.repo.save(this.repo.create(videoDetail));

    return data;
  }
  async findByWorkId(workId: string): Promise<VideoDetail | null> {
    return this.repo.findOneBy({ work_id: workId });
  }
  async save(videoDetail: VideoDetail): Promise<VideoDetail> {
    const existing = await this.repo.findOneBy({
      work_id: videoDetail.work_id,
    });
    if (!existing) {
      throw new Error(
        `Cannot save video detail ${videoDetail.work_id}: not found in repository`,
      );
    }
    const merged = this.repo.merge(
      existing,
      videoDetail as DeepPartial<VideoDetail>,
    );
    return this.repo.save(merged);
  }
}
