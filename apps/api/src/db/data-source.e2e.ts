import "reflect-metadata";
import { DataSource } from "typeorm";
import env from "@life-os/env";
import { User } from "@/db/entities/user.entity";
import { Account } from "@/db/entities/account.entity";
import { Session } from "@/db/entities/session.entity";
import { Habit } from "@/db/entities/habit.entity";
import { Entry } from "@/db/entities/entry.entity";

export const TestDataSource = new DataSource({
  type: "postgres",
  url: env.DATABASE_URL,
  dropSchema: true,
  synchronize: true,
  logging: false,
  entities: [User, Account, Session, Habit, Entry],
});
