import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import cors from "cors";
import helmet from "helmet";
import { asValue } from "awilix";
import { scopePerRequest } from "awilix-express";
import { configureContainer } from "./container";
import { interceptDatabaseError } from "./middleware/database";
import { interceptRoles, validateWhitelistedIp } from "./middleware/global.middleware";
import { initializePassportStrategies } from "./middleware/passport";
import { DITokens } from "./container.tokens";
import { MikroORM } from "@mikro-orm/better-sqlite";
import { RequestContext } from "@mikro-orm/core";
import { AppConstants } from "@/server.constants";
import { join } from "path";
import { ensureDirExists, superRootPath } from "@/utils/fs.utils";

export async function setupServer() {
  const dbFolder = process.env[AppConstants.DATABASE_PATH] || "./database";
  ensureDirExists(join(superRootPath(), dbFolder));

  const mikroORM = await MikroORM.init();
  // Migrating should be done in the boot task next to mongoose migrations
  await mikroORM.getMigrator().up();
  const entityManager = mikroORM.em;
  const providers = {
    [DITokens.orm]: asValue(mikroORM),
    [DITokens.em]: asValue(entityManager),
  };

  const httpServer = express();
  const container = configureContainer(false, providers);
  initializePassportStrategies(passport, container);

  httpServer
    .use(
      cors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      })
    )
    .use(
      helmet({
        contentSecurityPolicy: false,
      })
    )
    .use(json({ limit: "10mb" }))
    .use(cookieParser())
    .use(urlencoded({ extended: false }))
    .use(passport.initialize())
    .use(passport.authenticate(["jwt", "anonymous"], { session: false }))
    .use(scopePerRequest(container))
    .use(interceptDatabaseError)
    .use(async (req, res, next) => {
      const orm = await req.container.resolve(DITokens.orm);
      return RequestContext.create(orm.em, next);
    })
    // Global guards
    .use(validateWhitelistedIp)
    .use(interceptRoles);

  return {
    httpServer,
    container,
  };
}
