import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Work } from "./work.entity";

@Entity({ name: "video_detail" })
export class VideoDetail {
  @PrimaryColumn("uuid")
  work_id: string;

  @OneToOne(() => Work, { onDelete: "CASCADE" })
  @JoinColumn({ name: "work_id" })
  work: Work;

  @Column({ type: "text", nullable: true })
  platform: string | null;

  @Column({ type: "integer", nullable: true })
  duration_minutes: number | null;
}
