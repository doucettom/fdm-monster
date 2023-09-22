import { EntityManager, EntityRepository } from "@mikro-orm/better-sqlite";
import { EntityDTO, EntityName, FilterQuery, Loaded, wrap } from "@mikro-orm/core";
import { BaseEntity } from "@/entities/BaseEntity";
import { DEFAULT_PAGE, IBaseService, IPagination } from "@/services/orm/base.interface";
import { sqliteIdType } from "@/shared.constants";

export function BaseService<T extends BaseEntity>(entity: EntityName<T>) {
  abstract class BaseServiceHost implements IBaseService<T> {
    em: EntityManager;
    repository: EntityRepository<T>;

    constructor({ em }: { em: EntityManager }) {
      this.em = em;
      this.repository = em.getRepository(entity) as EntityRepository<T>;
    }

    abstract toDto(entity: Loaded<T>): EntityDTO<Loaded<T, never>>;

    async get(id: sqliteIdType) {
      return this.repository.findOneOrFail({ id } as FilterQuery<T>);
    }

    async list() {
      return this.repository.findAll();
    }

    async listPaged(page: IPagination = DEFAULT_PAGE) {
      return this.repository.findAll({ limit: page.pageSize, offset: page.pageSize * page.page });
    }

    async update(id: sqliteIdType, updateDto: Partial<EntityDTO<Loaded<T, never>>>) {
      const entity = await this.get(id);
      wrap(entity).assign(updateDto);
      await this.em.persistAndFlush(entity);
      return entity;
    }

    async create(dto: T) {
      const entity = this.repository.create(dto);
      await this.em.persistAndFlush(entity);
      return entity;
    }

    async delete(id: sqliteIdType) {
      const entity = await this.get(id);
      await this.em.removeAndFlush(entity);
    }
  }

  return BaseServiceHost;
}
