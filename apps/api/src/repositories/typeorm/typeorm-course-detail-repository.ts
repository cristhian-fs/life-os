import type { DataSource, DeepPartial, Repository } from "typeorm";
import { CourseDetail } from "@/db/entities/course-detail.entity";
import type {
  CourseDetailRepository,
  CreateCourseDetailInput,
} from "@/repositories/course-detail-repository";

export class TypeORMCourseDetailRepository implements CourseDetailRepository {
  protected readonly repo: Repository<CourseDetail>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(CourseDetail);
  }
  async create(courseDetail: CreateCourseDetailInput): Promise<CourseDetail> {
    const data = await this.repo.save(this.repo.create(courseDetail));

    return data;
  }
  async findByWorkId(workId: string): Promise<CourseDetail | null> {
    return this.repo.findOneBy({ work_id: workId });
  }
  async save(courseDetail: CourseDetail): Promise<CourseDetail> {
    const existing = await this.repo.findOneBy({
      work_id: courseDetail.work_id,
    });
    if (!existing) {
      throw new Error(
        `Cannot save course detail ${courseDetail.work_id}: not found in repository`,
      );
    }
    const merged = this.repo.merge(
      existing,
      courseDetail as DeepPartial<CourseDetail>,
    );
    return this.repo.save(merged);
  }
}
