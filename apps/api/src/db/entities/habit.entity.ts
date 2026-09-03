import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import type { Entry } from "./entry.entity";

export enum HabitType {
  BOOLEAN = "boolean",
  NUMERIC = "numeric",
}

export enum HabitGoalPeriod {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

export enum HabitStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
}

@Entity({ name: "habit" })
export class Habit {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  user_id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user?: User;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "enum", enum: HabitType, name: "type" })
  type: HabitType;

  @Column({ type: "text", nullable: true })
  unit: string | null;

  @Column({ type: "double precision", default: 1, nullable: true })
  goal_value: number | null;

  @Column({ type: "enum", enum: HabitGoalPeriod, name: "goal_period" })
  goal_period: HabitGoalPeriod;

  @Column({ type: "enum", enum: HabitStatus, name: "status" })
  status: HabitStatus;

  @Column({ type: "int", array: true, nullable: true, name: "active_weekdays" })
  active_weekdays: number[] | null;

  @CreateDateColumn({
    type: "timestamptz",
    name: "created_at",
    default: () => "now()",
  })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updated_at: Date;

  @Column({ type: "timestamptz", name: "archived_at", nullable: true })
  archived_at: Date | null;

  @OneToMany("Entry", (entry: Entry) => entry.habit)
  entries: Entry[];
}
