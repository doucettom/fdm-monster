import { IBaseService, Type } from "@/services/orm/base.interface";
import { SqliteIdType } from "@/shared.constants";
import { TypeormService } from "@/services/typeorm/typeorm.service";
import { DeepPartial, DeleteResult, EntityNotFoundError, EntityTarget, FindManyOptions, Repository } from "typeorm";
import { validate } from "class-validator";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { BaseEntity } from "@/entities/base.entity";
import { NotFoundException } from "@/exceptions/runtime.exceptions";
import { DEFAULT_PAGE, IPagination } from "@/services/interfaces/page.interface";
import { FindOptionsWhere } from "typeorm/find-options/FindOptionsWhere";

export function BaseService<
  T extends BaseEntity,
  DTO extends object,
  CreateDTO extends object = DeepPartial<T>,
  UpdateDTO extends object = QueryDeepPartialEntity<T>
>(entity: EntityTarget<T>, dto: Type<DTO>, createDTO?: Type<CreateDTO>, updateDto?: Type<UpdateDTO>) {
  abstract class BaseServiceHost implements IBaseService<T, DTO, CreateDTO, UpdateDTO> {
    typeormService: TypeormService;
    repository: Repository<T>;

    constructor({ typeormService }: { typeormService: TypeormService }) {
      this.typeormService = typeormService;
      this.repository = typeormService.getDataSource().getRepository(entity);
    }

    abstract toDto(entity: T): DTO;

    async get(id: SqliteIdType, throwIfNotFound = true) {
      try {
        return this.repository.findOneByOrFail({ id } as FindOptionsWhere<T> | FindOptionsWhere<T>[]);
      } catch (e) {
        if (throwIfNotFound && e instanceof EntityNotFoundError) {
          throw new NotFoundException(`The entity ${entity} with id '${id}' was not found.`);
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

    async update(id: SqliteIdType, updateDto: UpdateDTO) {
      const entity = await this.get(id);
      await validate(updateDto);
      await validate(Object.assign(entity, updateDto));
      await this.repository.update(entity.id, updateDto);
      return entity;
    }

    async create(dto: CreateDTO) {
      await validate(dto);
      const entity = this.repository.create(dto) as T;
      await validate(entity);
      return await this.repository.save(entity);
    }

    async delete(id: SqliteIdType, throwIfNotFound = true) {
      const entity = await this.get(id, throwIfNotFound);
      return await this.repository.delete(entity.id);
    }

    async deleteMany(ids: SqliteIdType[], emitEvent = true): Promise<DeleteResult> {
      return await this.repository.delete(ids);
    }
  }

  return BaseServiceHost;
}
