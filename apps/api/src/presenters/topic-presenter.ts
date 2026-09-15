import type { Topic } from "@/db/entities/topic.entity";
import type { TopicResponse, TopicTreeResponse } from "@/schemas/topics.schema";

export class TopicPresenter {
  static toHTTP(topic: Topic): TopicResponse {
    return {
      id: topic.id,
      user_id: topic.user_id,
      parent_topic_id: topic.parent_topic_id,
      title: topic.title,
      description: topic.description,
      body: topic.body,
      status: topic.status,
      order_index: topic.order_index,
      work_id: topic.work_id,
      created_at: topic.created_at.toISOString(),
      updated_at: topic.updated_at.toISOString(),
    };
  }

  static toHTTPList(topics: Topic[]): TopicResponse[] {
    return topics.map(TopicPresenter.toHTTP);
  }

  /** Nests the flat root+descendants list (from findTreeByRootId) into a single tree under `children`. */
  static toHTTPTree(topics: Topic[], rootId: string): TopicTreeResponse {
    const nodes = new Map<string, TopicTreeResponse>(
      topics.map((topic) => [topic.id, { ...TopicPresenter.toHTTP(topic), children: [] }]),
    );

    for (const topic of topics) {
      if (topic.id === rootId || !topic.parent_topic_id) continue;
      nodes.get(topic.parent_topic_id)?.children.push(nodes.get(topic.id) as TopicTreeResponse);
    }

    const root = nodes.get(rootId);
    if (!root) {
      throw new Error(`toHTTPTree: root topic ${rootId} missing from its own tree`);
    }

    return root;
  }
}
