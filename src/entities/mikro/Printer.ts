import { BaseEntity } from "@/entities/mikro/BaseEntity";
import { Collection, Entity, ManyToMany, Property } from "@mikro-orm/core";
import { Floor } from "@/entities/mikro/Floor";

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

  @ManyToMany({ entity: () => Floor, mappedBy: (f) => f.printers })
  position = new Collection<Floor>(this);
}
