import { randomUUID } from "node:crypto";
import type { Work } from "@/db/entities/work.entity";
import type {
  CreateWorkInput,
  WorkRepository,
} from "@/repositories/work-repository";

export class InMemoryWorkRepository implements WorkRepository {
  public items: Work[] = [];

  async create(data: CreateWorkInput): Promise<Work> {
    const work: Work = {
      id: randomUUID(),
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      creator: data.creator,
      status: data.status,
      rating: data.rating ?? null,
      started_at: data.started_at ?? null,
      completed_at: data.completed_at ?? null,
      summary: data.summary ?? null,
      external_url: data.external_url ?? null,
      image_url: data.image_url ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    } as Work;

    this.items.push(work);
    return work;
  }

  async delete(workId: string): Promise<void> {
    const workIndex = this.items.findIndex((item) => item.id === workId);
    if (workIndex === -1) return;
    this.items.splice(workIndex, 1);
  }

  async findById(workId: string): Promise<Work | null> {
    const work = this.items.find((item) => item.id === workId);

    if (!work) return null;

    return work;
  }

  async findManyByUserId(userId: string): Promise<Work[]> {
    return this.items.filter((item) => item.user_id === userId);
  }

  async save(work: Work): Promise<Work> {
    const workIndex = this.items.findIndex((item) => item.id === work.id);

    if (workIndex === -1)
      throw new Error(`Cannot save work ${work.id}: not found in repository`);

    this.items[workIndex] = work;
    return work;
  }
}
