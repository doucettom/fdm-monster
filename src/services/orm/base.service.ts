import { DEFAULT_PAGE, IBaseService, IPagination } from "@/services/orm/base.interface";
import { sqliteIdType } from "@/shared.constants";
import { TypeormService } from "@/services/typeorm/typeorm.service";
import { DeepPartial, EntityTarget, FindManyOptions, FindOneOptions, Repository } from "typeorm";
import { validate } from "class-validator";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { BaseEntity } from "@/entities/base.entity";

export function BaseService<T extends BaseEntity, DTO>(entity: EntityTarget<T>) {
  abstract class BaseServiceHost implements IBaseService<T> {
    typeormService: TypeormService;
    repository: Repository<T>;

    protected constructor({ typeormService }: { typeormService: TypeormService }) {
      this.typeormService = typeormService;
      this.repository = typeormService.getDataSource().getRepository(entity);
    }

    // TODO change any to DTO
    abstract toDto(entity: T): DTO;

    async get(id: sqliteIdType) {
      return this.repository.findOneOrFail({ id } as FindOneOptions<T>);
    }

    async list(options?: FindManyOptions<T>) {
      return this.repository.find(options);
    }

    async listPaged(page: IPagination = DEFAULT_PAGE, options?: FindManyOptions<T>) {
      return this.repository.find({ take: page.pageSize, skip: page.pageSize * page.page, ...options });
    }

    async update(id: sqliteIdType, updateDto: QueryDeepPartialEntity<T>) {
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

    async delete(id: sqliteIdType) {
      const entity = await this.get(id);
      return await this.repository.delete(entity.id);
    }
  }

  return BaseServiceHost;
}
