import { DEFAULT_PAGE, IBaseService, IPagination, Type } from "@/services/orm/base.interface";
import { SqliteIdType } from "@/shared.constants";
import { TypeormService } from "@/services/typeorm/typeorm.service";
import { DeepPartial, EntityNotFoundError, EntityTarget, FindManyOptions, FindOneOptions, Repository } from "typeorm";
import { validate } from "class-validator";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { BaseEntity } from "@/entities/base.entity";

export function BaseService<T extends BaseEntity, DTO extends object>(entity: EntityTarget<T>, dto: Type<DTO>) {
  abstract class BaseServiceHost implements IBaseService<T, DTO> {
    typeormService: TypeormService;
    repository: Repository<T>;

    protected constructor({ typeormService }: { typeormService: TypeormService }) {
      this.typeormService = typeormService;
      this.repository = typeormService.getDataSource().getRepository(entity);
    }

    // TODO change any to DTO
    abstract toDto(entity: T): DTO;

    async get(id: SqliteIdType, throwIfNotFound = true) {
      try {
        return this.repository.findOneOrFail({ id } as FindOneOptions<T>);
      } catch (e) {
        if (throwIfNotFound && e instanceof EntityNotFoundError) {
          throw new EntityNotFoundError(entity, id);
        }
        return undefined;
      }
    }

    async list(options?: FindManyOptions<T>) {
      return this.repository.find(options);
    }

    async listPaged(page: IPagination = DEFAULT_PAGE, options?: FindManyOptions<T>) {
      return this.repository.find({ take: page.pageSize, skip: page.pageSize * page.page, ...options });
    }

    async update(id: SqliteIdType, updateDto: QueryDeepPartialEntity<T>) {
      const entity = await this.get(id);
      const updateResult = await this.repository.update(entity.id, updateDto);
      if (updateResult.affected === 0) {
      }
      return entity;
    }

    async create(dto: DeepPartial<T>) {
      const entity = this.repository.create(dto);
      await validate(entity);
      return await this.repository.save(entity);
    }

    async delete(id: SqliteIdType, throwIfNotFound = true) {
      const entity = await this.get(id, throwIfNotFound);
      return await this.repository.delete(entity.id);
    }
  }

  return BaseServiceHost;
}
