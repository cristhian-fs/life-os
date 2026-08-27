import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Work } from "./work.entity";

@Entity({ name: "course_detail" })
export class CourseDetail {
  @PrimaryColumn("uuid")
  work_id: string;

  @OneToOne(() => Work, { onDelete: "CASCADE" })
  @JoinColumn({ name: "work_id" })
  work: Work;

  @Column({ type: "text", nullable: true })
  platform: string | null;

  @Column({ type: "text", nullable: true })
  instructor: string | null;

  @Column({
    type: "double precision",
    nullable: true,
  })
  duration_hours: number | null;
}
