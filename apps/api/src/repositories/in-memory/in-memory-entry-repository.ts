import { randomUUID } from "node:crypto";
import type { Entry } from "@/db/entities/entry.entity";
import type {
  CreateEntryInput,
  EntryRepository,
  FindByHabitAndDateRangeProps,
} from "@/repositories/entry-repository";

export class InMemoryEntryRepository implements EntryRepository {
  public items: Entry[] = [];

  async create(data: CreateEntryInput): Promise<Entry> {
    const entry: Entry = {
      id: randomUUID(),
      user_id: data.user_id,
      habit_id: data.habit_id,
      date: data.date,
      value_boolean: data.value_boolean ?? null,
      value_numeric: data.value_numeric ?? null,
      note: data.note ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    } as Entry;

    this.items.push(entry);

    return entry;
  }

  async delete(entryId: string): Promise<void> {
    const entryIndex = this.items.findIndex((item) => item.id === entryId);
    if (entryIndex === -1) return;
    this.items.splice(entryIndex, 1);
  }

  async findById(entryId: string): Promise<Entry | null> {
    const entry = this.items.find((item) => item.id === entryId);

    if (!entry) return null;

    return entry;
  }

  async findByHabitAndDateRange(
    habitId: string,
    props: FindByHabitAndDateRangeProps,
  ): Promise<Entry[]> {
    return this.items.filter(
      (item) =>
        item.habit_id === habitId &&
        item.date.getTime() >= props.startDate.getTime() &&
        item.date.getTime() <= props.endDate.getTime(),
    );
  }

  async update(entry: Entry): Promise<Entry | null> {
    const entryIndex = this.items.findIndex((item) => item.id === entry.id);
    if (entryIndex === -1) return null;

    this.items[entryIndex] = entry;
    return entry;
  }
}
