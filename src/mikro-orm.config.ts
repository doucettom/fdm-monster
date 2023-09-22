import { LoadStrategy, Options, ReflectMetadataProvider } from "@mikro-orm/core";
import { defineConfig } from "@mikro-orm/better-sqlite";
import { isProductionEnvironment } from "@/utils/env.utils";
import { AppConstants } from "@/server.constants";
import dotenv from "dotenv";
import { join } from "path";
import { superRootPath } from "@/utils/fs.utils";
import { Printer } from "@/entities/Printer";
import { Settings } from "@/entities/Settings";
import { Floor } from "@/entities/Floor";
import { FloorPosition } from "@/entities/FloorPosition";

dotenv.config({
  path: join(superRootPath(), ".env"),
});

const dbFolder = process.env[AppConstants.DATABASE_PATH] || "./database";
const dbFile = process.env[AppConstants.DATABASE_FILE] || "./fdm-monster.sqlite";
const isMemoryDb = dbFile === ":memory:";
const dbName = isMemoryDb ? dbFile : join(superRootPath(), dbFolder, dbFile);
console.log("Using database:", dbName);

const config: Options = defineConfig({
  dbName,
  metadataProvider: ReflectMetadataProvider,
  migrations: {
    path: "dist/migrations",
    pathTs: "src/migrations",
    snapshot: false,
  },
  entities: [Printer, Settings, Floor, FloorPosition],
  loadStrategy: LoadStrategy.JOINED,
  debug: !isProductionEnvironment() && process.env[AppConstants.debugMikroOrmKey] === "true",
});

export default config;
