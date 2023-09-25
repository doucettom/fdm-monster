import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";
import { Floor } from "@/entities/mikro/Floor";
import { Printer } from "@/entities/mikro/Printer";

@Entity()
export class FloorPosition {
  @Property({ nullable: false })
  x!: number;
  @Property({ nullable: false })
  y!: number;
  @ManyToOne(() => Floor, { nullable: false, primary: true })
  floor!: Rel<Floor>;
  @ManyToOne(() => Printer, { nullable: false, primary: true })
  printer!: Rel<Printer>;

  @Property({ persist: false })
  get floorId() {
    return this.floor.id;
  }
  @Property({ persist: false })
  get printerId() {
    return this.printer.id;
  }

  constructor(x: number, y: number, printer: Rel<Printer> | number, floor: Rel<Floor> | number) {
    this.x = x;
    this.y = y;
    this.printer = printer;
    this.floor = floor;
  }
}
