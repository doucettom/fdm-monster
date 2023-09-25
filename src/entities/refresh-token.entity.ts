import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { User } from "@/entities/user.entity";

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.refreshTokens, { nullable: false })
  @JoinColumn({ name: "userId" })
  user!: Relation<User>;

  @Column()
  userId!: number;

  @Column()
  createdAt!: Date;

  @Column()
  expiresAt!: number;

  @Column()
  refreshToken!: string;

  @Column()
  refreshAttemptsUsed!: number;
}
