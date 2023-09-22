import { BaseEntity } from "@/entities/BaseEntity";
import { Entity, OneToOne, Property, Rel } from "@mikro-orm/core";
import { FloorPosition } from "@/entities/FloorPosition";

@Entity()
export class Printer extends BaseEntity {
  @Property({ nullable: false })
  name!: string;

  @Property({ nullable: false })
  apiKey!: string;

  @Property({ nullable: false })
  printerURL!: string;

  @Property({ nullable: false, default: true })
  enabled!: boolean;

  @Property({ nullable: true, default: null })
  disabledReason!: string | null;

  @OneToOne(() => FloorPosition, (p) => p.printer, { nullable: true })
  position?: Rel<FloorPosition>;
}
