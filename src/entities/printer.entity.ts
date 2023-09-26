import { IsAlphanumeric } from "class-validator";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { FloorPosition } from "./floor-position.entity";
import { PrintCompletion } from "@/entities/print-completion.entity";
import { BaseEntity } from "@/entities/base.entity";

@Entity()
export class Printer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  printerUrl!: string;

  @Column()
  @IsAlphanumeric()
  apiKey!: string;

  @Column({
    nullable: false,
    default: true,
  })
  enabled: boolean = true;

  @Column({
    nullable: true,
  })
  disabledReason?: string;

  @Column({
    nullable: true,
  })
  assignee?: string;

  @OneToOne(() => FloorPosition, (fp) => fp.printer, {
    eager: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "floorPositionId" })
  floorPosition?: Relation<FloorPosition>;
  @Column({ nullable: true })
  floorPositionId!: number;

  @OneToMany(() => PrintCompletion, (pc) => pc.printer)
  printCompletions!: Relation<PrintCompletion>[];
}
