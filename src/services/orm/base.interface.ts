import { DeepPartial, DeleteResult, FindManyOptions, Repository } from "typeorm";
import { TypeormService } from "@/services/typeorm/typeorm.service";
import { SqliteIdType } from "@/shared.constants";
import { IPagination } from "@/services/interfaces/page.interface";

export interface IBaseService<
  T extends object,
  DTO extends object,
  CreateDTO extends object = DeepPartial<T>,
  UpdateDTO extends object = DTO
> {
  repository: Repository<T>;
  typeormService: TypeormService;

  toDto(entity: T): DTO;

  list(options?: FindManyOptions<T>): Promise<T[]>;

  listPaged(page: IPagination): Promise<T[]>;

  get(id: number): Promise<T | null>;

  create(dto: CreateDTO): Promise<T>;

  update(id: number, dto: UpdateDTO): Promise<T>;

  delete(id: number): Promise<DeleteResult>;

  deleteMany(ids: SqliteIdType[], emitEvent: boolean): Promise<DeleteResult>;
}

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}
