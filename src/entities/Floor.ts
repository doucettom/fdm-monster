import { BaseEntity } from "@/entities/BaseEntity";
import { Collection, Entity, OneToMany, Property } from "@mikro-orm/core";
import { Printer } from "@/entities/Printer";
import { IsNotEmpty, Min } from "class-validator";

@Entity()
export class Floor extends BaseEntity {
  constructor(name: string, floor: number) {
    super();
  }
  @IsNotEmpty()
  @Property({ nullable: false })
  name!: string;

  @Min(0)
  @Property({ nullable: false, unique: true })
  floor!: number;

  @OneToMany(() => Printer, (p) => p.floor, { nullable: false, eager: true })
  printers = new Collection<Printer>(this);
}
