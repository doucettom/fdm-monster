import { Entity, ManyToOne, OneToOne, Property, Rel } from "@mikro-orm/core";
import { Floor } from "@/entities/Floor";
import { Printer } from "@/entities/Printer";
import { BaseEntity } from "@/entities/BaseEntity";

@Entity()
export class FloorPosition extends BaseEntity {
  @Property({ nullable: false })
  x!: number;
  @Property({ nullable: false })
  y!: number;
  @ManyToOne(() => Floor, { nullable: false })
  floor?: Rel<Floor>;
  @Property({ nullable: false })
  floorId!: number;
  @OneToOne(() => Printer, { nullable: false, orphanRemoval: true })
  printer?: Rel<Printer>;
  @Property({ nullable: false })
  printerId!: number;

  constructor(x: number, y: number, printerId: number, floorId: number) {
    super();
    this.x = x;
    this.y = y;
    this.printerId = printerId;
    this.floorId = floorId;
  }
}
