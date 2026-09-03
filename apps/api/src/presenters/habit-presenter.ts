import type { Habit } from "@/db/entities/habit.entity";
import type { HabitResponse } from "@/schemas/habits.schema";

export class HabitPresenter {
  static toHTTP(habit: Habit): HabitResponse {
    return {
      id: habit.id,
      user_id: habit.user_id,
      name: habit.name,
      description: habit.description,
      type: habit.type,
      unit: habit.unit,
      goal_value: habit.goal_value,
      goal_period: habit.goal_period,
      status: habit.status,
      active_weekdays: habit.active_weekdays,
      created_at: habit.created_at.toISOString(),
      updated_at: habit.updated_at.toISOString(),
      archived_at: habit.archived_at?.toISOString() ?? null,
    };
  }

  static toHTTPList(habits: Habit[]): HabitResponse[] {
    return habits.map(HabitPresenter.toHTTP);
  }
}
