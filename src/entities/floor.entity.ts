import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";
import { FloorPosition } from "./floor-position.entity";

@Entity()
export class Floor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({
    unique: true,
  })
  floorNumber!: number;

  @OneToMany(() => FloorPosition, (gp) => gp.floor, { eager: true })
  floorPositions!: Relation<FloorPosition>[];
}
