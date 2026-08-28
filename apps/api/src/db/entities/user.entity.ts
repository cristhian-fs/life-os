import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import type { Habit } from "./habit.entity";
import type { Work } from "./work.entity";

@Entity({ name: "user" })
export class User {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text", unique: true })
  email: string;

  @Column({ type: "boolean", name: "emailVerified" })
  emailVerified: boolean;

  @Column({ type: "text", nullable: true })
  image: string | null;

  @Column({ type: "timestamptz", name: "createdAt" })
  createdAt: Date;

  @Column({ type: "timestamptz", name: "updatedAt" })
  updatedAt: Date;

  @OneToMany("Habit", (habit: Habit) => habit.user)
  habits: Habit[];

  @OneToMany("Work", (work: Work) => work.user)
  works: Work[];
}
