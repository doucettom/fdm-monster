import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { RefreshToken } from "@/entities/refresh-token.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column()
  isDemoUser!: boolean;

  @Column()
  isRootUser!: boolean;

  @Column()
  needsPasswordChange!: boolean;

  @Column()
  passwordHash!: string;

  @Column()
  createdAt!: Date;

  @Column({ type: "simple-array" })
  roles!: string[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens!: RefreshToken[];
}
