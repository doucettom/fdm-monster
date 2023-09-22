import { IsNotEmpty, Min } from "class-validator";
import { BaseEntity } from "@/entities/BaseEntity";
import { Collection, Entity, OneToMany, OptionalProps, Property } from "@mikro-orm/core";
import { FloorPosition } from "@/entities/FloorPosition";

@Entity()
export class Floor extends BaseEntity {
  [OptionalProps] = "positions";

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
  @OneToMany(() => FloorPosition, (fp) => fp.floor, { eager: true })
  positions = new Collection<FloorPosition>(this);
}
