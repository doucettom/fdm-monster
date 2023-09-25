import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

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
}
