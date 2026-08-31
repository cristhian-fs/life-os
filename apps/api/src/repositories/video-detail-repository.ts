import type { VideoDetail } from "@/db/entities/video-detail.entity";
import type { DetailRepository } from "./detail-repository";

export type CreateVideoDetailInput = {
  work_id: string;
  platform?: string | null;
  duration_minutes?: number | null;
};

export interface VideoDetailRepository extends DetailRepository<
  VideoDetail,
  CreateVideoDetailInput
> {}
