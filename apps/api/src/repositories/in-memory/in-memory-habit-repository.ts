import { randomUUID } from "node:crypto";
import { HabitStatus, type Habit } from "@/db/entities/habit.entity";
import type {
  CreateHabitInput,
  HabitRepository,
} from "@/repositories/habit-repository";

export class InMemoryHabitsRepository implements HabitRepository {
  public items: Habit[] = [];

  async create(data: CreateHabitInput): Promise<Habit> {
    const habit: Habit = {
      id: randomUUID(),
      user_id: data.user_id,
      name: data.name,
      description: data.description ?? null,
      unit: data.unit ?? null,
      entries: [],
      goal_period: data.goal_period,
      goal_value: data.goal_value ?? null,
      status: HabitStatus.ACTIVE, // sempre ativo na criação — não devia vir de fora
      created_at: new Date(),
      updated_at: new Date(),
      archived_at: null,
      type: data.type,
    };
    this.items.push(habit);
    return habit;
  }

  async archive(habitId: string): Promise<Habit | null> {
    const habitIndex = this.items.findIndex((item) => item.id === habitId);

    if (habitIndex === -1) return null;

    const data = this.items[habitIndex];
    data.status = HabitStatus.ARCHIVED;
    data.archived_at = new Date();

    return data;
  }

  async delete(habitId: string): Promise<void> {
    const habitIndex = this.items.findIndex((item) => item.id === habitId);
    if (habitIndex === -1) return;
    this.items.splice(habitIndex, 1);
  }

  async findById(habitId: string): Promise<Habit | null> {
    const habit = this.items.find((item) => item.id === habitId);

    if (!habit) return null;

    return habit;
  }

  async findManyByUserId(userId: string): Promise<Habit[]> {
    const habits = this.items.filter((item) => item.user_id === userId);

    if (!habits.length) return [];

    return habits;
  }

  async save(habit: Habit): Promise<Habit | null> {
    const habitIndex = this.items.findIndex((item) => item.id === habit.id);

    if (habitIndex === -1) return null;

    this.items[habitIndex] = habit;
    return habit;
  }
}
