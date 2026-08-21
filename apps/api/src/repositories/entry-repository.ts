import type { Entry } from "@/db/entities/entry.entity";

export type CreateEntryInput = {
  user_id: string;
  habit_id: string;
  date: Date;
  value_boolean?: boolean | null;
  value_numeric?: number | null;
  note?: string | null;
};

export type FindByHabitAndDateRangeProps = {
  startDate: Date;
  endDate: Date;
};

export interface EntryRepository {
  create(entry: CreateEntryInput): Promise<Entry>;
  findById(entryId: string): Promise<Entry | null>;
  update(entry: Entry): Promise<Entry | null>;
  delete(entryId: string): Promise<void>;
  findByHabitAndDateRange(
    habitId: string,
    props: FindByHabitAndDateRangeProps,
  ): Promise<Entry[]>;
}
