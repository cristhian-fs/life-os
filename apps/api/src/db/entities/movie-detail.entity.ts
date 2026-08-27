import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Work } from "./work.entity";

@Entity({ name: "movie_detail" })
export class MovieDetail {
  @PrimaryColumn("uuid")
  work_id: string;

  @OneToOne(() => Work, { onDelete: "CASCADE" })
  @JoinColumn({ name: "work_id" })
  work: Work;

  @Column({ type: "integer", nullable: true })
  runtime_minutes: number | null;

  @Column({ type: "text", nullable: true })
  director: string | null;
}
