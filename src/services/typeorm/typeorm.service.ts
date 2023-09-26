import { DataSource } from "typeorm";
import { LoggerService } from "@/handlers/logger";
import { AppDataSource } from "@/data-source";

export class TypeormService {
  loaded = false;
  private dataSource?: DataSource;

  logger = new LoggerService(TypeormService.name);

  public getDataSource() {
    if (!this.dataSource) {
      this.loadDataSources();
    }

    return this.dataSource!;
  }

  public async createConnection() {
    const dataSource = this.loadDataSources();
    const connection = await dataSource.initialize();
    this.logger.log("Typeorm connection initialized");
    this.loaded = true;
    return connection;
  }

  private loadDataSources() {
    this.dataSource = AppDataSource;
    return this.dataSource!;
  }
}
