import type { Entry } from "@/db/entities/entry.entity";
import type { EntryResponse } from "@/schemas/entries.schema";

export class EntryPresenter {
  static toHTTP(entry: Entry): EntryResponse {
    return {
      id: entry.id,
      user_id: entry.user_id,
      habit_id: entry.habit_id,
      date: entry.date.toISOString(),
      value_boolean: entry.value_boolean,
      value_numeric: entry.value_numeric,
      note: entry.note,
      created_at: entry.created_at.toISOString(),
      updated_at: entry.updated_at.toISOString(),
    };
  }

  static toHTTPList(entries: Entry[]): EntryResponse[] {
    return entries.map(EntryPresenter.toHTTP);
  }
}
