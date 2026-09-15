import { describe, expect, it } from "vitest";
import { TopicStatus, type Topic } from "@/db/entities/topic.entity";
import { TopicPresenter } from "./topic-presenter";

function stubTopic(overrides: Partial<Topic> = {}): Topic {
  return {
    id: "root",
    user_id: "user_01",
    parent_topic_id: null,
    title: "Topic",
    description: null,
    body: null,
    status: TopicStatus.NOT_STARTED,
    order_index: null,
    work_id: null,
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-01-01"),
    ...overrides,
  };
}

describe("Topic Presenter", () => {
  describe("toHTTPTree", () => {
    it("nests descendants under their parent's children array", () => {
      const root = stubTopic({ id: "root", title: "Algorithms" });
      const child = stubTopic({
        id: "child",
        title: "Sorting",
        parent_topic_id: "root",
      });
      const grandchild = stubTopic({
        id: "grandchild",
        title: "Quicksort",
        parent_topic_id: "child",
      });

      const tree = TopicPresenter.toHTTPTree([root, child, grandchild], "root");

      expect(tree).toEqual(
        expect.objectContaining({
          id: "root",
          children: [
            expect.objectContaining({
              id: "child",
              children: [expect.objectContaining({ id: "grandchild", children: [] })],
            }),
          ],
        }),
      );
    });

    it("returns the root with an empty children array when it has no descendants", () => {
      const root = stubTopic({ id: "root" });

      const tree = TopicPresenter.toHTTPTree([root], "root");

      expect(tree).toEqual(expect.objectContaining({ id: "root", children: [] }));
    });

    it("handles siblings under the same parent", () => {
      const root = stubTopic({ id: "root" });
      const childA = stubTopic({ id: "child-a", parent_topic_id: "root" });
      const childB = stubTopic({ id: "child-b", parent_topic_id: "root" });

      const tree = TopicPresenter.toHTTPTree([root, childA, childB], "root");

      expect(tree.children).toHaveLength(2);
      expect(tree.children.map((child) => child.id)).toEqual(
        expect.arrayContaining(["child-a", "child-b"]),
      );
    });

    it("throws when the root id is not present in the given topics", () => {
      const child = stubTopic({ id: "child", parent_topic_id: "root" });

      expect(() => TopicPresenter.toHTTPTree([child], "root")).toThrow();
    });
  });
});
