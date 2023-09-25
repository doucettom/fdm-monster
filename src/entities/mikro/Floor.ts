import { IsNotEmpty, Min } from "class-validator";
import { BaseEntity } from "@/entities/mikro/BaseEntity";
import { Collection, Entity, ManyToMany, OneToMany, OptionalProps, Property } from "@mikro-orm/core";
import { FloorPosition } from "@/entities/mikro/FloorPosition";
import { Printer } from "@/entities/mikro/Printer";

@Entity()
export class Floor extends BaseEntity {
  constructor(name: string, floor: number) {
    super();
    this.name = name;
    this.floor = floor;
  }

  @IsNotEmpty()
  @Property({ nullable: false })
  name!: string;
  @Min(0)
  @Property({ nullable: false, unique: true })
  floor!: number;

  @OneToMany(() => FloorPosition, (position) => position.floor)
  positions = new Collection<FloorPosition>(this);
  @ManyToMany({ entity: () => Printer, pivotEntity: () => FloorPosition, eager: true })
  printers = new Collection<Printer>(this);
}
