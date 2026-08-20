import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { User } from "./user.entity";

@Entity({ name: "account" })
export class Account {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text", name: "userId" })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "text", name: "accountId" })
  accountId: string;

  @Column({ type: "text", name: "providerId" })
  providerId: string;

  @Column({ type: "text", nullable: true, name: "accessToken" })
  accessToken: string | null;

  @Column({ type: "text", nullable: true, name: "refreshToken" })
  refreshToken: string | null;

  @Column({ type: "timestamptz", nullable: true, name: "accessTokenExpiresAt" })
  accessTokenExpiresAt: Date | null;

  @Column({ type: "timestamptz", nullable: true, name: "refreshTokenExpiresAt" })
  refreshTokenExpiresAt: Date | null;

  @Column({ type: "text", nullable: true })
  scope: string | null;

  @Column({ type: "text", nullable: true, name: "idToken" })
  idToken: string | null;

  @Column({ type: "text", nullable: true })
  password: string | null;

  @Column({ type: "timestamptz", name: "createdAt" })
  createdAt: Date;

  @Column({ type: "timestamptz", name: "updatedAt" })
  updatedAt: Date;
}
