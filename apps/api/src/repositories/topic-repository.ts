import type { Topic } from "@/db/entities/topic.entity";

export interface CreateTopicInput {
  user_id: string;
  parent_topic_id?: string | null;
  title: string;
  description?: string | null;
  body?: string | null;
  order_index?: number | null;
  work_id?: string | null;
}

export interface TopicRepository {
  create(habit: CreateTopicInput): Promise<Topic>;
  findById(habitId: string): Promise<Topic | null>;
  findManyByUserId(userId: string): Promise<Topic[]>;
  /** Root topic plus every descendant, following parent_topic_id down the tree. */
  findTreeByRootId(rootTopicId: string): Promise<Topic[]>;
  save(habit: Topic): Promise<Topic>;
  delete(habitId: string): Promise<void>;
}
