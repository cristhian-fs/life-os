import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Work } from "./work.entity";
import { User } from "./user.entity";

@Entity({ name: "purchase_wishlist" })
export class PurchaseWishlist {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  user_id: string;
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user?: User;

  @Column({ type: "uuid", nullable: true })
  work_id: string | null;

  @ManyToOne(() => Work, { onDelete: "CASCADE" })
  @JoinColumn({ name: "work_id" })
  work?: Work;

  @Column({ type: "text", name: "title", nullable: true })
  title: string | null;

  @Column({
    type: "integer",
    name: "estimated_price_in_cents",
    nullable: true,
  })
  estimated_price_in_cents: number | null;

  @Column({ type: "text", name: "currency", nullable: true })
  currency: string | null;

  // Only used when no work is linked — a linked work's own image_url is shown instead.
  @Column({ type: "text", name: "image_url", nullable: true })
  image_url: string | null;

  @Column({ type: "text" })
  store_or_url: string;

  @Column({ type: "timestamptz", name: "purchased_at", nullable: true })
  purchased_at: Date | null;

  @CreateDateColumn({
    type: "timestamptz",
    name: "created_at",
    default: () => "now()",
  })
  created_at: Date;
}
