import type { DataSource, DeepPartial, Repository } from "typeorm";
import { Topic, TopicStatus } from "@/db/entities/topic.entity";
import type {
  CreateTopicInput,
  TopicRepository,
} from "@/repositories/topic-repository";

export class TypeORMTopicRepository implements TopicRepository {
  protected readonly repo: Repository<Topic>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Topic);
  }

  async create(topic: CreateTopicInput): Promise<Topic> {
    const data = await this.repo.save(
      this.repo.create({ ...topic, status: TopicStatus.NOT_STARTED }),
    );

    return data;
  }

  async findById(topicId: string): Promise<Topic | null> {
    const data = await this.repo.findOneBy({ id: topicId });

    if (!data) return null;

    return data;
  }

  async findManyByUserId(userId: string): Promise<Topic[]> {
    return this.repo.findBy({ user_id: userId });
  }

  async findTreeByRootId(rootTopicId: string): Promise<Topic[]> {
    return this.repo.query(
      `WITH RECURSIVE topic_tree AS (
        SELECT * FROM topic WHERE id = $1
        UNION ALL
        SELECT t.* FROM topic t
        INNER JOIN topic_tree tt ON t.parent_topic_id = tt.id
      )
      SELECT * FROM topic_tree`,
      [rootTopicId],
    );
  }

  async save(topic: Topic): Promise<Topic> {
    const existing = await this.findById(topic.id);
    if (!existing) {
      throw new Error(`Cannot save topic ${topic.id}: not found in repository`);
    }
    const merged = this.repo.merge(existing, topic as DeepPartial<Topic>);
    return this.repo.save(merged);
  }

  async delete(topicId: string): Promise<void> {
    await this.repo.delete({ id: topicId });
  }
}
