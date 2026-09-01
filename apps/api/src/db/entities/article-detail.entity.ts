import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Work } from "./work.entity";

@Entity({ name: "article_detail" })
export class ArticleDetail {
  @PrimaryColumn("uuid")
  work_id: string;

  @OneToOne(() => Work, { onDelete: "CASCADE" })
  @JoinColumn({ name: "work_id" })
  work: Work;

  @Column({ type: "text" })
  source_name: string;

  @Column({ type: "int", nullable: true })
  reading_time_minutes: number | null;

  @Column({ type: "timestamptz", nullable: true })
  published_at: Date | null;
}
