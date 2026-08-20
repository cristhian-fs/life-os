import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { ensureInitialized } from "@/lib/utils";
import type { AppRouteHandler } from "@/lib/types";
import type { ListHabitsRoute } from "./habit.routes";
import { GetUserHabitsUseCase } from "@/use-cases/get-user-habits";
import { TypeORMHabitRepository } from "@/repositories/typeorm/typeorm-habit-repository";
import { HabitPresenter } from "@/presenters/habit-presenter";

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
