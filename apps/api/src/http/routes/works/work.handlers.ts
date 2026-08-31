import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "@/lib/types";
import { ensureInitialized } from "@/lib/utils";
import { WorkPresenter } from "@/presenters/work-presenter";
import { TypeORMArticleDetailRepository } from "@/repositories/typeorm/typeorm-article-detail-repository";
import { TypeORMBookDetailRepository } from "@/repositories/typeorm/typeorm-book-detail-repository";
import { TypeORMCourseDetailRepository } from "@/repositories/typeorm/typeorm-course-detail-repository";
import { TypeORMMovieDetailRepository } from "@/repositories/typeorm/typeorm-movie-detail-repository";
import { TypeORMVideoDetailRepository } from "@/repositories/typeorm/typeorm-video-detail-repository";
import { TypeORMWorkRepository } from "@/repositories/typeorm/typeorm-work-repository";
import type { WorkDetailRepositories } from "@/repositories/work-detail-repositories";
import { CreateWorkUseCase } from "@/use-cases/create-work";
import { DeleteUserWorkUseCase } from "@/use-cases/delete-user-work";
import { GetUserWorksUseCase } from "@/use-cases/get-user-works";
import { UpdateUserWorkUseCase } from "@/use-cases/update-user-work";
import type {
  CreateWorkRoute,
  DeleteWorkRoute,
  ListWorksRoute,
  UpdateWorkRoute,
} from "./work.routes";

function requireUser(c: { get: (key: "user") => unknown }) {
  const user = c.get("user") as { id: string } | null;

  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  return user;
}

async function makeDetailRepositories(): Promise<WorkDetailRepositories> {
  const dataSource = await ensureInitialized();

  return {
    book: new TypeORMBookDetailRepository(dataSource),
    movie: new TypeORMMovieDetailRepository(dataSource),
    article: new TypeORMArticleDetailRepository(dataSource),
    course: new TypeORMCourseDetailRepository(dataSource),
    video: new TypeORMVideoDetailRepository(dataSource),
  };
}

export const create: AppRouteHandler<CreateWorkRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = requireUser(c);

  const payload = c.req.valid("json");

  const worksRepository = new TypeORMWorkRepository(dataSource);
  const detailRepositories = await makeDetailRepositories();
  const useCase = new CreateWorkUseCase(worksRepository, detailRepositories);

  const { work, detail } = await useCase.execute({
    userId: user.id,
    payload,
  });

  return c.json(WorkPresenter.toHTTP(work, detail), HttpStatusCodes.OK);
};

export const list: AppRouteHandler<ListWorksRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = requireUser(c);

  const worksRepository = new TypeORMWorkRepository(dataSource);
  const detailRepositories = await makeDetailRepositories();
  const useCase = new GetUserWorksUseCase(worksRepository, detailRepositories);

  const { works } = await useCase.execute({ userId: user.id });

  return c.json(WorkPresenter.toHTTPList(works), HttpStatusCodes.OK);
};

export const update: AppRouteHandler<UpdateWorkRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = requireUser(c);

  const { id } = c.req.valid("param");
  const payload = c.req.valid("json");

  const worksRepository = new TypeORMWorkRepository(dataSource);
  const detailRepositories = await makeDetailRepositories();
  const useCase = new UpdateUserWorkUseCase(worksRepository, detailRepositories);

  const { work } = await useCase.execute({
    userId: user.id,
    workId: id,
    payload,
  });

  if (!work) {
    return c.json(
      { message: "Work item not found" },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  const detail = await detailRepositories[work.type].findByWorkId(work.id);

  return c.json(WorkPresenter.toHTTP(work, detail), HttpStatusCodes.OK);
};

export const deleteWork: AppRouteHandler<DeleteWorkRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = requireUser(c);

  const { id } = c.req.valid("param");

  const worksRepository = new TypeORMWorkRepository(dataSource);
  const useCase = new DeleteUserWorkUseCase(worksRepository);

  const { success } = await useCase.execute({ userId: user.id, workId: id });

  if (!success) {
    return c.json(
      { success, message: "Work item not found" },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(
    { success, message: "Work item deleted" },
    HttpStatusCodes.OK,
  );
};
