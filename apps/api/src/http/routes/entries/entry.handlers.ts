import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { ensureInitialized } from "@/lib/utils";
import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateEntryRoute,
  DeleteEntryRoute,
  ListEntriesRoute,
  UpdateEntryRoute,
} from "./entry.routes";
import { CreateUserEntryUseCase } from "@/use-cases/create-user-entry";
import { GetUserEntriesUseCase } from "@/use-cases/get-user-entries";
import { UpdateUserEntryUseCase } from "@/use-cases/update-user-entry";
import { DeleteUserEntryUseCase } from "@/use-cases/delete-user-entry";
import { TypeORMEntryRepository } from "@/repositories/typeorm/typeorm-entry-repository";
import { TypeORMHabitRepository } from "@/repositories/typeorm/typeorm-habit-repository";
import { EntryPresenter } from "@/presenters/entry-presenter";

export const create: AppRouteHandler<CreateEntryRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const payload = c.req.valid("json");

  const entriesRepository = new TypeORMEntryRepository(dataSource);
  const habitsRepository = new TypeORMHabitRepository(dataSource);
  const useCase = new CreateUserEntryUseCase(
    entriesRepository,
    habitsRepository,
  );

  const result = await useCase.execute({
    userId: user.id,
    payload: { ...payload, date: new Date(payload.date) },
  });

  if (!result.success) {
    const status =
      result.reason === "forbidden"
        ? HttpStatusCodes.FORBIDDEN
        : HttpStatusCodes.NOT_FOUND;
    return c.json({ message: "Habit not found" }, status);
  }

  return c.json(EntryPresenter.toHTTP(result.data), HttpStatusCodes.OK);
};

export const list: AppRouteHandler<ListEntriesRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const { habitId, startDate, endDate } = c.req.valid("query");

  const entriesRepository = new TypeORMEntryRepository(dataSource);
  const habitsRepository = new TypeORMHabitRepository(dataSource);
  const useCase = new GetUserEntriesUseCase(
    entriesRepository,
    habitsRepository,
  );

  const result = await useCase.execute({
    userId: user.id,
    habitId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  if (!result.success) {
    const status =
      result.reason === "forbidden"
        ? HttpStatusCodes.FORBIDDEN
        : HttpStatusCodes.NOT_FOUND;
    return c.json({ message: "Habit not found" }, status);
  }

  return c.json(EntryPresenter.toHTTPList(result.data), HttpStatusCodes.OK);
};

export const update: AppRouteHandler<UpdateEntryRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const { id } = c.req.valid("param");
  const { date, ...rest } = c.req.valid("json");

  const entriesRepository = new TypeORMEntryRepository(dataSource);
  const useCase = new UpdateUserEntryUseCase(entriesRepository);

  const { entry } = await useCase.execute({
    userId: user.id,
    entryId: id,
    payload: { ...rest, ...(date && { date: new Date(date) }) },
  });

  if (!entry) {
    return c.json({ message: "Entry not found" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(EntryPresenter.toHTTP(entry), HttpStatusCodes.OK);
};

export const deleteEntry: AppRouteHandler<DeleteEntryRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const { id } = c.req.valid("param");

  const entriesRepository = new TypeORMEntryRepository(dataSource);
  const useCase = new DeleteUserEntryUseCase(entriesRepository);

  const { success } = await useCase.execute({
    userId: user.id,
    entryId: id,
  });

  if (!success) {
    return c.json(
      { success, message: "Entry not found" },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json({ success, message: "Entry deleted" }, HttpStatusCodes.OK);
};
