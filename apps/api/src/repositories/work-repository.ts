import type { Work, WorkStatus, WorkType } from "@/db/entities/work.entity";

export type CreateWorkInput = {
  user_id: string;
  title: string;
  type: WorkType;
  creator: string;
  status: WorkStatus;
  rating?: number;
  started_at?: Date;
  completed_at?: Date;
  summary?: string;
  external_url?: string | null;
  image_url?: string | null;
};

export interface WorkRepository {
  create(work: CreateWorkInput): Promise<Work>;
  findById(workId: string): Promise<Work | null>;
  findManyByUserId(userId: string): Promise<Work[]>;
  save(work: Work): Promise<Work>;
  delete(workId: string): Promise<void>;
}
