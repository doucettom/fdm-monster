import { EntityManager, EntityRepository } from "@mikro-orm/better-sqlite";
import { EntityName } from "@mikro-orm/core";
import { BaseEntity } from "@/entities/BaseEntity";

export interface IBaseService<T extends object> {
  repository: EntityRepository<T>;
  em: EntityManager;

  list(): Promise<T[]>;
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

export function BaseService<T extends BaseEntity>(entity: EntityName<T>) {
  class BaseServiceHost implements IBaseService<T> {
    em: EntityManager;
    repository: EntityRepository<T>;

    constructor({ em }: { em: EntityManager }) {
      this.em = em;
      this.repository = em.getRepository(entity) as EntityRepository<T>;
    }

    async get(id: number) {
      return this.repository.findOneOrFail({ id });
    }

    async list() {
      return this.repository.findAll();
    }

    async listPaged(page: IPagination = DEFAULT_PAGE) {
      return this.repository.findAll({ limit: page.pageSize, offset: page.pageSize * page.page });
    }

    async create(dto: T) {
      const entity = this.repository.create(dto);
      await this.em.persistAndFlush(entity);
      return entity;
    }

    async delete(id: number) {
      const entity = await this.repository.findOneOrFail({ id });
      await this.em.removeAndFlush(entity);
    }
  }

  return BaseServiceHost;
}
