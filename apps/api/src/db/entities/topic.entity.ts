import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Work } from "./work.entity";

export enum TopicStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  MASTERED = "mastered",
}

@Entity({ name: "topic" })
export class Topic {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "text" })
  user_id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user?: User;

  @Index()
  @Column({ type: "uuid", nullable: true })
  parent_topic_id: string | null;

  @ManyToOne(() => Topic, { onDelete: "CASCADE" })
  @JoinColumn({ name: "parent_topic_id" })
  topic?: Topic;

  @Column({ type: "text", name: "title" })
  title: string;

  @Column({ type: "text", name: "description", nullable: true })
  description: string | null;

  /** Free-form markdown annotations/notes for the topic. */
  @Column({ type: "text", name: "body", nullable: true })
  body: string | null;

  @Column({ type: "enum", enum: TopicStatus, name: "status" })
  status: TopicStatus;

  @Column({ type: "integer", name: "order_index", nullable: true })
  order_index: number | null;

  @Column({ type: "uuid", nullable: true })
  work_id: string | null;

  @ManyToOne(() => Work, { onDelete: "CASCADE" })
  @JoinColumn({ name: "work_id" })
  work?: Work;

  @CreateDateColumn({
    type: "timestamptz",
    name: "created_at",
    default: () => "now()",
  })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updated_at: Date;
}
