import type { Entry } from "@/db/entities/entry.entity";

type findByHabitAndDateRangeProps = {
  startDate: Date;
  endDate: Date;
};

export interface EntryRepository {
  create(entry: Entry): Promise<Entry>;
  findById(entryId: string): Promise<Entry | null>;
  update(entry: Entry): Promise<Entry | null>;
  delete(entryId: string): Promise<void>;
  findByHabitAndDateRange(
    habitId: string,
    props: findByHabitAndDateRangeProps,
  ): Promise<Entry[]>;
}
