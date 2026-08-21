import type { Repository, DataSource, DeepPartial } from "typeorm";
import { Entry } from "@/db/entities/entry.entity";
import type {
  CreateEntryInput,
  EntryRepository,
  FindByHabitAndDateRangeProps,
} from "@/repositories/entry-repository";

export class TypeORMEntryRepository implements EntryRepository {
  protected readonly repo: Repository<Entry>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Entry);
  }
  async create(entry: CreateEntryInput): Promise<Entry> {
    const data = await this.repo.save(this.repo.create(entry));

    return data;
  }
  async delete(entryId: string): Promise<void> {
    await this.repo.delete({ id: entryId });
  }
  async findByHabitAndDateRange(
    habitId: string,
    props: FindByHabitAndDateRangeProps,
  ): Promise<Entry[]> {
    const data = await this.repo
      .createQueryBuilder("entry")
      .where("entry.habit_id = :habitId", { habitId })
      .andWhere("entry.date BETWEEN :startDate AND :endDate", {
        startDate: props.startDate,
        endDate: props.endDate,
      })
      .getMany();

    return data;
  }
  async findById(entryId: string): Promise<Entry | null> {
    const data = await this.repo.findOneBy({ id: entryId });

    if (!data) return null;

    return data;
  }
  async update(entry: Entry): Promise<Entry | null> {
    const existing = await this.findById(entry.id);
    if (!existing) return null;
    const merged = this.repo.merge(existing, entry as DeepPartial<Entry>);
    return this.repo.save(merged);
  }
}
