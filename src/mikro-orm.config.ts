import { LoadStrategy, Options, ReflectMetadataProvider } from "@mikro-orm/core";
import { defineConfig } from "@mikro-orm/better-sqlite";
import { Floor, Printer, Settings } from "./entities";
import { isProductionEnvironment } from "@/utils/env.utils";
import { AppConstants } from "@/server.constants";
import dotenv from "dotenv";
import { join } from "path";
import { superRootPath } from "@/utils/fs.utils";

dotenv.config({
  path: join(superRootPath(), ".env"),
});

const dbFolder = process.env[AppConstants.DATABASE_PATH] || "./database";
const dbName = join(superRootPath(), dbFolder, "fdm-monster.sqlite");
console.log("Using database:", dbName);

const config: Options = defineConfig({
  dbName,
  metadataProvider: ReflectMetadataProvider,
  migrations: {
    path: "dist/migrations",
    pathTs: "src/migrations",
  },
  entities: [Printer, Settings, Floor],
  loadStrategy: LoadStrategy.JOINED,
  debug: !isProductionEnvironment() && process.env[AppConstants.debugMikroOrmKey] === "true",
});

export default config;
