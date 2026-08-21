import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Habit } from "./habit.entity";
import { User } from "./user.entity";

@Entity({ name: "entry" })
export class Entry {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  user_id: string;

  @Column({ type: "uuid" })
  habit_id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Habit, { onDelete: "CASCADE" })
  @JoinColumn({ name: "habit_id" })
  habit: Habit;

  @Column({
    type: "date",
    name: "date",
    transformer: {
      to: (value: Date) => value,
      from: (value: string) => new Date(value),
    },
  })
  date: Date;

  @Column({ type: "boolean", name: "value_boolean", nullable: true })
  value_boolean: boolean | null;

  @Column({ type: "double precision", name: "value_numeric", nullable: true })
  value_numeric: number | null;

  @Column({ type: "text", name: "note", nullable: true })
  note: string | null;

  @CreateDateColumn({
    type: "timestamptz",
    name: "created_at",
    default: () => "now()",
  })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updated_at: Date;
}
