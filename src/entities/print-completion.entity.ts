import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Printer } from "@/entities/printer.entity";

@Entity()
export class PrintCompletion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  fileName!: string;

  @Column()
  createdAt!: number;

  @Column()
  status!: string;

  @ManyToOne(() => Printer, (p) => p.printCompletions, { onDelete: "NO ACTION" })
  @JoinColumn({ name: "printerId" })
  printer!: Relation<Printer>;

  @Column({ nullable: false })
  printerId!: number;

  @Column({ nullable: true })
  printerReference?: string;

  @Column({ nullable: true })
  completionLog?: string;

  @Column({ type: "simple-json", nullable: true })
  context!: object;
}
