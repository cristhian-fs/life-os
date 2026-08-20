import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { User } from "./user.entity";

@Entity({ name: "session" })
export class Session {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text", name: "userId" })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "text", unique: true })
  token: string;

  @Column({ type: "timestamptz", name: "expiresAt" })
  expiresAt: Date;

  @Column({ type: "text", nullable: true, name: "ipAddress" })
  ipAddress: string | null;

  @Column({ type: "text", nullable: true, name: "userAgent" })
  userAgent: string | null;

  @Column({ type: "timestamptz", name: "createdAt" })
  createdAt: Date;

  @Column({ type: "timestamptz", name: "updatedAt" })
  updatedAt: Date;
}
