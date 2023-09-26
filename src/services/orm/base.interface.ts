import { DeleteResult, FindManyOptions, Repository } from "typeorm";
import { TypeormService } from "@/services/typeorm/typeorm.service";

export interface IBaseService<T extends object, DTO extends object> {
  repository: Repository<T>;
  typeormService: TypeormService;

  toDto(entity: T): DTO;

  list(options?: FindManyOptions<T>): Promise<T[]>;

  listPaged(page: IPagination): Promise<T[]>;

  get(id: number): Promise<T | null>;

  create(dto: T): Promise<T>;

  delete(id: number): Promise<DeleteResult>;
}

export const DEFAULT_PAGE: IPagination = {
  page: 0,
  pageSize: 50,
};

export interface IPagination {
  page: number;
  pageSize: number;
}

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}
