import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { ensureInitialized } from "@/lib/utils";
import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateTopicRoute,
  DeleteTopicRoute,
  GetTopicRoute,
  ListTopicsRoute,
  TopicTreeRoute,
  UpdateTopicRoute,
} from "./topic.routes";
import { GetUserTopicsUseCase } from "@/use-cases/get-user-topics";
import { GetUserTopicUseCase } from "@/use-cases/get-user-topic";
import { UpdateUserTopicUseCase } from "@/use-cases/update-user-topic";
import { DeleteUserTopicUseCase } from "@/use-cases/delete-user-topic";
import { CreateUserTopicUseCase } from "@/use-cases/create-user-topic";
import { GetUserTopicTreeUseCase } from "@/use-cases/get-user-topic-tree";
import { TypeORMTopicRepository } from "@/repositories/typeorm/typeorm-topic-repository";
import { TopicPresenter } from "@/presenters/topic-presenter";

export const create: AppRouteHandler<CreateTopicRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const payload = c.req.valid("json");

  const topicsRepository = new TypeORMTopicRepository(dataSource);
  const useCase = new CreateUserTopicUseCase(topicsRepository);

  const { topic } = await useCase.execute({
    payload,
    userId: user.id,
  });

  return c.json(TopicPresenter.toHTTP(topic), HttpStatusCodes.OK);
};

export const list: AppRouteHandler<ListTopicsRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const topicsRepository = new TypeORMTopicRepository(dataSource);
  const useCase = new GetUserTopicsUseCase(topicsRepository);

  const { topics } = await useCase.execute({ userId: user.id });

  return c.json(TopicPresenter.toHTTPList(topics), HttpStatusCodes.OK);
};

export const get: AppRouteHandler<GetTopicRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const { id } = c.req.valid("param");

  const topicsRepository = new TypeORMTopicRepository(dataSource);
  const useCase = new GetUserTopicUseCase(topicsRepository);

  const result = await useCase.execute({ userId: user.id, topicId: id });

  if (!result.success) {
    return c.json({ message: "Topic not found" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(TopicPresenter.toHTTP(result.data), HttpStatusCodes.OK);
};

export const update: AppRouteHandler<UpdateTopicRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const { id } = c.req.valid("param");
  const payload = c.req.valid("json");

  const topicsRepository = new TypeORMTopicRepository(dataSource);
  const useCase = new UpdateUserTopicUseCase(topicsRepository);

  const { topic } = await useCase.execute({
    userId: user.id,
    topicId: id,
    payload,
  });

  if (!topic) {
    return c.json({ message: "Topic not found" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(TopicPresenter.toHTTP(topic), HttpStatusCodes.OK);
};

export const deleteTopic: AppRouteHandler<DeleteTopicRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const { id } = c.req.valid("param");

  const topicsRepository = new TypeORMTopicRepository(dataSource);
  const useCase = new DeleteUserTopicUseCase(topicsRepository);

  const { success } = await useCase.execute({
    userId: user.id,
    topicId: id,
  });

  if (!success) {
    return c.json(
      { success, message: "Topic not found" },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json({ success, message: "Topic deleted" }, HttpStatusCodes.OK);
};

export const tree: AppRouteHandler<TopicTreeRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const { id } = c.req.valid("param");

  const topicsRepository = new TypeORMTopicRepository(dataSource);
  const useCase = new GetUserTopicTreeUseCase(topicsRepository);

  const result = await useCase.execute({ userId: user.id, rootTopicId: id });

  if (!result.success) {
    return c.json({ message: "Topic not found" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(TopicPresenter.toHTTPTree(result.data, id), HttpStatusCodes.OK);
};
