import { AppDataSource } from "@/db/data-source";

export async function ensureInitialized() {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();

  return AppDataSource;
}
