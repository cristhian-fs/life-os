import type { DataSource, DeepPartial, Repository } from "typeorm";
import { Work } from "@/db/entities/work.entity";
import type {
  CreateWorkInput,
  WorkRepository,
} from "@/repositories/work-repository";

export class TypeORMWorkRepository implements WorkRepository {
  protected readonly repo: Repository<Work>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Work);
  }
  async delete(workId: string): Promise<void> {
    await this.repo.delete({ id: workId });
  }
  async create(work: CreateWorkInput): Promise<Work> {
    const data = await this.repo.save(this.repo.create(work));

    return data;
  }
  async findById(workId: string): Promise<Work | null> {
    const data = await this.repo.findOneBy({ id: workId });

    if (!data) return null;

    return data;
  }
  async findManyByUserId(userId: string): Promise<Work[]> {
    const data = await this.repo.findBy({ user_id: userId });

    return data;
  }
  async save(work: Work): Promise<Work> {
    const existing = await this.findById(work.id);
    if (!existing) {
      throw new Error(`Cannot save work ${work.id}: not found in repository`);
    }
    const merged = this.repo.merge(existing, work as DeepPartial<Work>);
    return this.repo.save(merged);
  }
}
