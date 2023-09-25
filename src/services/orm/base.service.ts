import { EntityManager, EntityRepository } from "@mikro-orm/better-sqlite";
import { EntityDTO, EntityName, FilterQuery, FindOptions, Loaded, wrap } from "@mikro-orm/core";
import { BaseEntity } from "@/entities/mikro/BaseEntity";
import { DEFAULT_PAGE, IBaseService, IPagination } from "@/services/orm/base.interface";
import { sqliteIdType } from "@/shared.constants";

export function BaseService<T extends BaseEntity, DTO>(entity: EntityName<T>) {
  abstract class BaseServiceHost implements IBaseService<T> {
    em: EntityManager;
    repository: EntityRepository<T>;

    constructor({ em }: { em: EntityManager }) {
      this.em = em;
      this.repository = em.getRepository(entity) as EntityRepository<T>;
    }

    abstract toDto<P extends string = never>(entity: Loaded<T, P>): DTO;

    async get<P extends string = never>(id: sqliteIdType) {
      return this.repository.findOneOrFail<P>({ id } as FilterQuery<T>);
    }

    async list<P extends string = never>(options?: FindOptions<T, P>) {
      return this.repository.findAll(options);
    }

    async listPaged<P extends string = never>(page: IPagination = DEFAULT_PAGE, options?: FindOptions<T, P>) {
      return this.repository.findAll({ limit: page.pageSize, offset: page.pageSize * page.page, ...options });
    }

    async update<P extends string = never>(id: sqliteIdType, updateDto: Partial<EntityDTO<Loaded<T, P>>>) {
      const entity = await this.get<P>(id);
      wrap(entity).assign(updateDto);
      await this.em.persistAndFlush(entity);
      return entity;
    }

    async create<P extends string = never>(dto: T) {
      const entity = this.repository.create<P>(dto);
      await this.em.persistAndFlush(entity);
      return entity;
    }

    async delete<P extends string = never>(id: sqliteIdType) {
      const entity = await this.get<P>(id);
      await this.em.removeAndFlush(entity);
    }
  }

  return BaseServiceHost;
}
