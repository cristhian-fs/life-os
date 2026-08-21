import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { ensureInitialized } from "@/lib/utils";
import type { AppRouteHandler } from "@/lib/types";
import type {
  ArchiveHabitRoute,
  BestStreaksRoute,
  CalendarMapRoute,
  CreateHabitRoute,
  DeleteHabitRoute,
  HistoryBarRoute,
  ListHabitsRoute,
  ScoreHistoryRoute,
  UpdateHabitRoute,
} from "./habit.routes";
import { GetUserHabitsUseCase } from "@/use-cases/get-user-habits";
import { UpdateUserHabitUseCase } from "@/use-cases/update-user-habit";
import { TypeORMHabitRepository } from "@/repositories/typeorm/typeorm-habit-repository";
import { TypeORMEntryRepository } from "@/repositories/typeorm/typeorm-entry-repository";
import { HabitPresenter } from "@/presenters/habit-presenter";
import { StreakPresenter } from "@/presenters/streak-presenter";
import { ScorePresenter } from "@/presenters/score-presenter";
import { HistoryBarPresenter } from "@/presenters/history-bar-presenter";
import { DeleteUserHabitUseCase } from "@/use-cases/delete-user-habit";
import { CreateUserHabitUseCase } from "@/use-cases/create-user-habit";
import { ArchiveUserHabitUseCase } from "@/use-cases/archive-user-habit";
import { BestStreaksUseCase } from "@/use-cases/best-streaks-use-case";
import { ScoreHistoryUseCase } from "@/use-cases/score-history-use-case";
import { CalendarMapUseCase } from "@/use-cases/calendar-map-use-case";
import { HistoryBarUseCase } from "@/use-cases/history-bar-use-case";

export const create: AppRouteHandler<CreateHabitRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const payload = c.req.valid("json");

  const habitsRepository = new TypeORMHabitRepository(dataSource);
  const useCase = new CreateUserHabitUseCase(habitsRepository);

  const habit = await useCase.execute({
    payload,
    userId: user.id,
  });

  return c.json(HabitPresenter.toHTTP(habit.habit), HttpStatusCodes.OK);
};

export const list: AppRouteHandler<ListHabitsRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const habitsRepository = new TypeORMHabitRepository(dataSource);
  const useCase = new GetUserHabitsUseCase(habitsRepository);

  const habits = await useCase.execute({ userId: user.id });

  return c.json(HabitPresenter.toHTTPList(habits.habits), HttpStatusCodes.OK);
};

export const update: AppRouteHandler<UpdateHabitRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const { id } = c.req.valid("param");
  const payload = c.req.valid("json");

  const habitsRepository = new TypeORMHabitRepository(dataSource);
  const useCase = new UpdateUserHabitUseCase(habitsRepository);

  const { habit } = await useCase.execute({
    userId: user.id,
    habitId: id,
    payload,
  });

  if (!habit) {
    return c.json({ message: "Habit not found" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(HabitPresenter.toHTTP(habit), HttpStatusCodes.OK);
};

export const deleteHabit: AppRouteHandler<DeleteHabitRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const { id } = c.req.valid("param");

  const habitsRepository = new TypeORMHabitRepository(dataSource);
  const useCase = new DeleteUserHabitUseCase(habitsRepository);

  const { success } = await useCase.execute({
    userId: user.id,
    habitId: id,
  });

  if (!success) {
    return c.json(
      { success, message: "Habit not found" },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json({ success, message: "Habit deleted" }, HttpStatusCodes.OK);
};

export const archiveHabit: AppRouteHandler<ArchiveHabitRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const { id } = c.req.valid("param");

  const habitsRepository = new TypeORMHabitRepository(dataSource);
  const useCase = new ArchiveUserHabitUseCase(habitsRepository);

  const result = await useCase.execute({
    userId: user.id,
    habitId: id,
  });

  if (!result.success) {
    return c.json({ message: "Habit not found" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(HabitPresenter.toHTTP(result.data), HttpStatusCodes.OK);
};

export const bestStreaks: AppRouteHandler<BestStreaksRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const { id } = c.req.valid("param");

  const habitsRepository = new TypeORMHabitRepository(dataSource);
  const entriesRepository = new TypeORMEntryRepository(dataSource);
  const useCase = new BestStreaksUseCase(habitsRepository, entriesRepository);

  const result = await useCase.execute({ userId: user.id, habitId: id });

  if (!result.success) {
    return c.json({ message: "Habit not found" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(StreakPresenter.toHTTPList(result.data), HttpStatusCodes.OK);
};

export const scoreHistory: AppRouteHandler<ScoreHistoryRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const { id } = c.req.valid("param");
  const { period } = c.req.valid("query");

  const habitsRepository = new TypeORMHabitRepository(dataSource);
  const entriesRepository = new TypeORMEntryRepository(dataSource);
  const useCase = new ScoreHistoryUseCase(habitsRepository, entriesRepository);

  const result = await useCase.execute({ userId: user.id, habitId: id, period });

  if (!result.success) {
    return c.json({ message: "Habit not found" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(ScorePresenter.toHTTPList(result.data), HttpStatusCodes.OK);
};

export const historyBar: AppRouteHandler<HistoryBarRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const { id } = c.req.valid("param");
  const { period } = c.req.valid("query");

  const habitsRepository = new TypeORMHabitRepository(dataSource);
  const entriesRepository = new TypeORMEntryRepository(dataSource);
  const useCase = new HistoryBarUseCase(habitsRepository, entriesRepository);

  const result = await useCase.execute({ userId: user.id, habitId: id, period });

  if (!result.success) {
    return c.json({ message: "Habit not found" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(HistoryBarPresenter.toHTTPList(result.data), HttpStatusCodes.OK);
};

export const calendarMap: AppRouteHandler<CalendarMapRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = c.get("user");

  if (!user) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  const { id } = c.req.valid("param");

  const habitsRepository = new TypeORMHabitRepository(dataSource);
  const entriesRepository = new TypeORMEntryRepository(dataSource);
  const useCase = new CalendarMapUseCase(habitsRepository, entriesRepository);

  const result = await useCase.execute({ userId: user.id, habitId: id });

  if (!result.success) {
    return c.json({ message: "Habit not found" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(ScorePresenter.toHTTPList(result.data), HttpStatusCodes.OK);
};
