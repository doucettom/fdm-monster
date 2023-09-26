import { Column, Entity, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Printer } from "@/entities/printer.entity";
import { BaseEntity } from "@/entities/base.entity";

@Entity()
export class CameraStream extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  streamURL!: string;

  @OneToOne(() => Printer, { nullable: true })
  printer?: Relation<Printer>;

  @Column({ nullable: false, default: "16:9" })
  aspectRatio!: string;

  @Column({ nullable: false, default: 0 })
  rotationClockwise!: number;

  @Column({ nullable: false, default: false })
  flipHorizontal!: boolean;

  @Column({ nullable: false, default: false })
  flipVertical!: boolean;
}
