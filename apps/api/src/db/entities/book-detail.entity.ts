import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Work } from "./work.entity";

@Entity({ name: "book_detail" })
export class BookDetail {
  @PrimaryColumn("uuid")
  work_id: string;

  @OneToOne(() => Work, { onDelete: "CASCADE" })
  @JoinColumn({ name: "work_id" })
  work: Work;

  @Column({ type: "text", nullable: true })
  isbn: string | null;

  @Column({ type: "int", nullable: true })
  pages: number | null;

  @Column({ type: "text", nullable: true })
  publisher: string | null;
}
