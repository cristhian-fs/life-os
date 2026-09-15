import { TopicStatus, type Topic } from "@/db/entities/topic.entity";
import type { CreateTopicInput, TopicRepository } from "../topic-repository";
import { randomUUID } from "node:crypto";

export class InMemoryTopicRepository implements TopicRepository {
  public items: Topic[] = [];

  async create(topic: CreateTopicInput): Promise<Topic> {
    const topicData: Topic = {
      id: randomUUID(),
      created_at: new Date(),
      updated_at: new Date(),
      user_id: topic.user_id,
      title: topic.title,
      description: topic.description ?? null,
      body: topic.body ?? null,
      order_index: topic.order_index ?? null,
      parent_topic_id: topic.parent_topic_id ?? null,
      status: TopicStatus.NOT_STARTED,
      work_id: topic.work_id ?? null,
    };

    this.items.push(topicData);
    return topicData;
  }

  async save(topic: Topic): Promise<Topic> {
    const topicIndex = this.items.findIndex((item) => item.id === topic.id);

    if (topicIndex === -1)
      throw new Error(`Cannot save topic ${topic.id}: not found in repository`);

    this.items[topicIndex] = topic;
    return topic;
  }

  async findById(topicId: string): Promise<Topic | null> {
    const topic = this.items.find((item) => item.id === topicId);

    if (!topic) return null;

    return topic;
  }

  async delete(topicId: string): Promise<void> {
    const topicIndex = this.items.findIndex((item) => item.id === topicId);
    if (topicIndex === -1) return;
    this.items.splice(topicIndex, 1);
  }

  async findManyByUserId(userId: string): Promise<Topic[]> {
    const topic = this.items.filter((item) => item.user_id === userId);

    if (!topic.length) return [];

    return topic;
  }

  async findTreeByRootId(rootTopicId: string): Promise<Topic[]> {
    const root = this.items.find((item) => item.id === rootTopicId);
    if (!root) return [];

    // ponytail: assumes parent_topic_id forms a tree (no cycles), same as the UNION ALL SQL it mirrors
    const tree = [root];
    const pendingParentIds = [root.id];

    while (pendingParentIds.length) {
      const parentId = pendingParentIds.shift() as string;
      const children = this.items.filter((item) => item.parent_topic_id === parentId);
      tree.push(...children);
      pendingParentIds.push(...children.map((child) => child.id));
    }

    return tree;
  }
}
