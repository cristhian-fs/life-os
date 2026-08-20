import { randomUUID } from "node:crypto";
import type { Entry } from "@/db/entities/entry.entity";
import type { EntryRepository } from "@/repositories/entry-repository";

export class InMemoryEntryRepository implements EntryRepository {
  public items: Entry[] = [];
  async create(data: Entry): Promise<Entry> {
    const entry: Entry = {
      id: randomUUID(),
      user_id: data.user_id,
      date: new Date(),
      habit_id: data.habit_id,
      note: data.note,
      created_at: new Date(),
      updated_at: new Date(),
      value_boolean: data.value_boolean,
      value_numeric: data.value_numeric,
      habit: data.habit,
      user: data.user,
    };

    this.items.push(entry);

    return entry;
  }

  async delete(entryId: string): Promise<void> {
    const entryIndex = this.items.findIndex((item) => item.id === entryId);
    this.items.slice(entryIndex, 1);
  }

  async findById(entryId: string): Promise<Entry | null> {
    const entry = this.items.find((item) => item.id === entryId);

    if (!entry) return null;

    return entry;
  }

  async findByHabitAndDateRange(
    habitId: string,
    props: { startDate: Date; endDate: Date },
  ): Promise<Entry[]> {
    return this.items.filter(
      (item) =>
        item.id === habitId &&
        item.date.toTimeString() >= props.startDate.toTimeString() &&
        item.date.toTimeString() <= props.endDate.toTimeString(),
    );
  }

  async update(entry: Entry): Promise<Entry> {
    const entryIndex = this.items.findIndex((item) => item.id === entry.id);

    this.items[entryIndex] = entry;
    return entry;
  }
}
