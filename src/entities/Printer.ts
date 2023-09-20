import { BaseEntity } from "@/entities/BaseEntity";
import { Entity, ManyToOne, OptionalProps, Property } from "@mikro-orm/core";
import { Floor } from "./Floor";

@Entity()
export class Printer extends BaseEntity {
  [OptionalProps]?: "floor";

  @Property({ nullable: false })
  name!: string;

  @Property({ nullable: false })
  apiKey!: string;

  @Property({ nullable: false })
  printerURL!: string;

  @Property({ nullable: false })
  enabled!: boolean;

  @Property({ nullable: false })
  disabledReason!: string;

  @ManyToOne({ nullable: true })
  floor!: Floor;
}
