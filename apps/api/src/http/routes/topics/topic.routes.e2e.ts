import app from "@/app";
import { TestDataSource } from "@/db/data-source.e2e";
import { describe, beforeAll, afterAll, beforeEach, expect, it } from "vitest";
import type { TestHelpers } from "better-auth/plugins";
import { auth } from "@/lib/auth";
import { Topic, TopicStatus } from "@/db/entities/topic.entity";
import { makeTopic, makeTopicEntity } from "@/test/factories";

describe("[E2E] Topics Routes", () => {
  let test: TestHelpers;

  beforeAll(async () => {
    await TestDataSource.initialize();
    const ctx = await auth.$context;
    test = ctx.test;
  });

  beforeEach(async () => {
    // TRUNCATE (unlike DELETE) refuses tables with incoming FKs unless
    // truncated together, so clear topic/user in one CASCADE statement.
    await TestDataSource.query(`TRUNCATE TABLE "topic", "user" CASCADE`);
  });

  afterAll(async () => {
    await TestDataSource.destroy();
  });

  it("should list an empty list for the user with no topics added", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const res = await app.request("/api/topics", { headers });
    const topics = await res.json();

    expect(topics).toEqual([]);

    await test.deleteUser(user.id);
  });

  it("should list a list of the user topics", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    await TestDataSource.getRepository(Topic).save(
      TestDataSource.getRepository(Topic).create([
        makeTopicEntity({ user_id: user.id, title: "Algorithms" }),
        makeTopicEntity({ user_id: user.id, title: "Databases" }),
      ]),
    );

    const res = await app.request("/api/topics", { headers });
    const topics = await res.json();

    expect(topics).toHaveLength(2);
    expect(topics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Algorithms" }),
        expect.objectContaining({ title: "Databases" }),
      ]),
    );

    await test.deleteUser(user.id);
  });

  it("should return a topic on GET /topics/{id}", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const topic = await TestDataSource.getRepository(Topic).save(
      TestDataSource.getRepository(Topic).create(
        makeTopicEntity({ user_id: user.id, title: "Algorithms" }),
      ),
    );

    const res = await app.request(`/api/topics/${topic.id}`, { headers });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({ id: topic.id, title: "Algorithms" }),
    );

    await test.deleteUser(user.id);
  });

  it("should return 404 getting a topic that does not exist", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const res = await app.request(
      "/api/topics/00000000-0000-0000-0000-000000000000",
      { headers },
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual(expect.objectContaining({ message: "Topic not found" }));

    await test.deleteUser(user.id);
  });

  it("should return the updated topic after a PATCH request", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const topic = await TestDataSource.getRepository(Topic).save(
      TestDataSource.getRepository(Topic).create(
        makeTopicEntity({ user_id: user.id, title: "Algorithms" }),
      ),
    );

    headers.set("Content-Type", "application/json");
    const res = await app.request(`/api/topics/${topic.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        title: "Advanced Algorithms",
        status: TopicStatus.IN_PROGRESS,
      }),
    });
    const updated = await res.json();

    expect(res.status).toBe(200);
    expect(updated).toEqual(
      expect.objectContaining({
        id: topic.id,
        title: "Advanced Algorithms",
        status: TopicStatus.IN_PROGRESS,
      }),
    );

    await test.deleteUser(user.id);
  });

  it("should create a topic on POST", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });
    headers.set("Content-Type", "application/json");

    const { user_id: _userId, ...body } = makeTopic();

    const res = await app.request("/api/topics", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const topic = await res.json();

    expect(res.status).toBe(200);
    expect(topic).toEqual(
      expect.objectContaining({
        user_id: user.id,
        title: body.title,
        status: TopicStatus.NOT_STARTED,
      }),
    );

    await test.deleteUser(user.id);
  });

  it("should delete a topic on DELETE", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const topic = await TestDataSource.getRepository(Topic).save(
      TestDataSource.getRepository(Topic).create(
        makeTopicEntity({ user_id: user.id }),
      ),
    );

    const res = await app.request(`/api/topics/${topic.id}`, {
      method: "DELETE",
      headers,
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({ success: true, message: "Topic deleted" }),
    );

    const stored = await TestDataSource.getRepository(Topic).findOneBy({
      id: topic.id,
    });
    expect(stored).toBeNull();

    await test.deleteUser(user.id);
  });

  it("should return 404 deleting a topic that does not exist", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const res = await app.request(
      "/api/topics/00000000-0000-0000-0000-000000000000",
      { method: "DELETE", headers },
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual(
      expect.objectContaining({ success: false, message: "Topic not found" }),
    );

    await test.deleteUser(user.id);
  });

  it("should return the topic tree on GET /topics/{id}/tree", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const root = await TestDataSource.getRepository(Topic).save(
      TestDataSource.getRepository(Topic).create(
        makeTopicEntity({ user_id: user.id, title: "Algorithms" }),
      ),
    );
    const child = await TestDataSource.getRepository(Topic).save(
      TestDataSource.getRepository(Topic).create(
        makeTopicEntity({
          user_id: user.id,
          title: "Sorting",
          parent_topic_id: root.id,
        }),
      ),
    );
    const grandchild = await TestDataSource.getRepository(Topic).save(
      TestDataSource.getRepository(Topic).create(
        makeTopicEntity({
          user_id: user.id,
          title: "Quicksort",
          parent_topic_id: child.id,
        }),
      ),
    );
    // unrelated topic, should not appear in the tree
    await TestDataSource.getRepository(Topic).save(
      TestDataSource.getRepository(Topic).create(
        makeTopicEntity({ user_id: user.id, title: "Databases" }),
      ),
    );

    const res = await app.request(`/api/topics/${root.id}/tree`, { headers });
    const tree = await res.json();

    expect(res.status).toBe(200);
    expect(tree).toEqual(
      expect.objectContaining({
        id: root.id,
        children: [
          expect.objectContaining({
            id: child.id,
            children: [expect.objectContaining({ id: grandchild.id, children: [] })],
          }),
        ],
      }),
    );

    await test.deleteUser(user.id);
  });

  it("should return 404 for the tree of a topic that does not exist", async () => {
    const user = test.createUser({ email: "test@example.com" });
    await test.saveUser(user);

    const headers = await test.getAuthHeaders({ userId: user.id });

    const res = await app.request(
      "/api/topics/00000000-0000-0000-0000-000000000000/tree",
      { headers },
    );

    expect(res.status).toBe(404);

    await test.deleteUser(user.id);
  });
});
