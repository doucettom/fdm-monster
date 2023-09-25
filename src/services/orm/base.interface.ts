import { EntityManager, EntityRepository } from "@mikro-orm/better-sqlite";
import { FindOptions } from "@mikro-orm/core";

export interface IBaseService<T extends object> {
  repository: EntityRepository<T>;
  em: EntityManager;

  list<P extends string = never>(options?: FindOptions<T, P>): Promise<T[]>;

  listPaged(page: IPagination): Promise<T[]>;

  create(dto: T): Promise<T>;

  delete(id: number): Promise<void>;
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
