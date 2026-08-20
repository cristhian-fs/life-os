import "reflect-metadata";
import { DataSource } from "typeorm";
import { fileURLToPath } from "url";
import path from "path";
import env from "@life-os/env";
import { User } from "@/db/entities/user.entity";
import { Account } from "@/db/entities/account.entity";
import { Session } from "@/db/entities/session.entity";
import { Habit } from "@/db/entities/habit.entity";
import { Entry } from "@/db/entities/entry.entity";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const AppDataSource = new DataSource({
  type: "postgres",
  url: env.DATABASE_URL,
  synchronize: false,
  migrations: [path.join(__dirname, "/migrations/**/*.ts")],
  entities: [User, Account, Session, Habit, Entry],
});
