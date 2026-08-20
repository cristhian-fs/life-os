import type { DataSource, DeepPartial, Repository } from "typeorm";
import { Habit, HabitStatus } from "@/db/entities/habit.entity";
import type {
  CreateHabitInput,
  HabitRepository,
} from "@/repositories/habit-repository";

export class TypeORMHabitRepository implements HabitRepository {
  protected readonly repo: Repository<Habit>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Habit);
  }
  async delete(habitId: string): Promise<void> {
    await this.repo.delete({ id: habitId });
  }
  async archive(habitId: string): Promise<Habit | null> {
    const existing = await this.findById(habitId);
    if (!existing) return null;

    existing.status = HabitStatus.ARCHIVED;
    const data = await this.repo.save(existing);
    return data;
  }
  async create(habit: CreateHabitInput): Promise<Habit> {
    const data = await this.repo.save(this.repo.create(habit));

    return data;
  }
  async findById(habitId: string): Promise<Habit | null> {
    const data = await this.repo.findOneBy({ id: habitId });

    if (!data) return null;

    return data;
  }
  async findManyByUserId(userId: string): Promise<Habit[]> {
    const data = await this.repo.findBy({ user_id: userId });

    return data;
  }
  async save(habit: Habit): Promise<Habit | null> {
    const existing = await this.findById(habit.id);
    if (!existing) return null;
    const merged = this.repo.merge(existing, habit as DeepPartial<Habit>);
    return this.repo.save(merged);
  }
}
