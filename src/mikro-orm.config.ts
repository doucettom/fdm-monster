// Patch BetterSqlitePlatform
import { BetterSqlitePlatform, defineConfig } from "@mikro-orm/better-sqlite";
BetterSqlitePlatform.prototype.supportsDownMigrations = () => true;

import { LoadStrategy, Options, PopulateHint, ReflectMetadataProvider } from "@mikro-orm/core";
import { isProductionEnvironment } from "@/utils/env.utils";
import { AppConstants } from "@/server.constants";
import dotenv from "dotenv";
import { join } from "path";
import { superRootPath } from "@/utils/fs.utils";
import { Printer } from "@/entities/mikro/Printer";
import { Settings } from "@/entities/mikro/Settings";
import { Floor } from "@/entities/mikro/Floor";
import { FloorPosition } from "@/entities/mikro/FloorPosition";

dotenv.config({
  path: join(superRootPath(), ".env"),
});

const dbFolder = process.env[AppConstants.DATABASE_PATH] || "./database";
const dbFile = process.env[AppConstants.DATABASE_FILE] || "./fdm-monster.sqlite";
const isMemoryDb = dbFile === ":memory:";
const dbName = isMemoryDb ? dbFile : join(superRootPath(), dbFolder, dbFile);
console.log("Executing config", __filename, "\nDir", __dirname, "\nUsing database:", dbName);

const config: Options = defineConfig({
  dbName,
  metadataProvider: ReflectMetadataProvider,
  migrations: {
    path: "dist/mikro-migrations",
    pathTs: "src/mikro-migrations",
    // disableForeignKeys: false,
    // With or without snapshot, columns are not dropped
    // https://github.com/mikro-orm/mikro-orm/discussions/4660
    snapshot: false,
    safe: false,
  },
  autoJoinOneToOneOwner: false,
  // populateWhere: PopulateHint.ALL,
  entities: [Printer, Settings, Floor, FloorPosition],
  loadStrategy: LoadStrategy.JOINED,
  debug: !isProductionEnvironment() && process.env[AppConstants.debugMikroOrmKey] === "true",
});

export default config;
