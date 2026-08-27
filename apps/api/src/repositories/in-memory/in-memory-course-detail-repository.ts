import type { CourseDetail } from "@/db/entities/course-detail.entity";
import type {
  CourseDetailRepository,
  CreateCourseDetailInput,
} from "@/repositories/course-detail-repository";

export class InMemoryCourseDetailRepository implements CourseDetailRepository {
  public items: CourseDetail[] = [];

  async create(data: CreateCourseDetailInput): Promise<CourseDetail> {
    const courseDetail: CourseDetail = {
      work_id: data.work_id,
      platform: data.platform ?? null,
      instructor: data.instructor ?? null,
      duration_hours: data.duration_hours ?? null,
    } as CourseDetail;

    this.items.push(courseDetail);
    return courseDetail;
  }

  async findByWorkId(workId: string): Promise<CourseDetail | null> {
    return this.items.find((item) => item.work_id === workId) ?? null;
  }

  async save(courseDetail: CourseDetail): Promise<CourseDetail> {
    const index = this.items.findIndex(
      (item) => item.work_id === courseDetail.work_id,
    );

    if (index === -1)
      throw new Error(
        `Cannot save course detail ${courseDetail.work_id}: not found in repository`,
      );

    this.items[index] = courseDetail;
    return courseDetail;
  }
}
