import type { CourseDetail } from "@/db/entities/course-detail.entity";
import type { DetailRepository } from "./detail-repository";

export type CreateCourseDetailInput = {
  work_id: string;
  platform?: string | null;
  instructor?: string | null;
  duration_hours?: number | null;
};

export interface CourseDetailRepository extends DetailRepository<
  CourseDetail,
  CreateCourseDetailInput
> {}
