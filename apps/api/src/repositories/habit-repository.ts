import type {
  Habit,
  HabitGoalPeriod,
  HabitType,
} from "@/db/entities/habit.entity";

export type CreateHabitInput = {
  user_id: string;
  name: string;
  description?: string | null;
  type: HabitType;
  unit?: string | null;
  goal_value?: number | null;
  goal_period: HabitGoalPeriod;
};

export interface HabitRepository {
  create(habit: CreateHabitInput): Promise<Habit>;
  findById(habitId: string): Promise<Habit | null>;
  findManyByUserId(userId: string): Promise<Habit[]>;
  save(habit: Habit): Promise<Habit | null>;
  delete(habitId: string): Promise<void>;
  archive(habitId: string): Promise<Habit | null>;
}
