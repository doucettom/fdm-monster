const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const { configureContainer } = require("./container");
const { scopePerRequest } = require("awilix-express");
const cors = require("cors");
const helmet = require("helmet");
const { interceptDatabaseError } = require("./middleware/database");
const { validateWhitelistedIp, interceptRoles } = require("./middleware/global.middleware");
const { initializePassportStrategies } = require("./middleware/passport");
const { RequestContext } = require("@mikro-orm/core");
const DITokens = require("./container.tokens");
const { MikroORM } = require("@mikro-orm/better-sqlite");
const { asValue } = require("awilix");
const { Printer: PrinterORM } = require("./entities/Printer");

async function setupServer() {
  const httpServer = express();
  const container = configureContainer();
  initializePassportStrategies(passport, container);

  const mikroORM = await MikroORM.init();
  const entityManager = mikroORM.em;
  container.register({
    [DITokens.orm]: asValue(mikroORM),
    [DITokens.em]: asValue(entityManager),
    printerRepository: asValue(entityManager.getRepository(PrinterORM)),
    // [DITokens.em]: asFunction(mikroORM.em.fork.bind(mikroORM.em)).scoped(),
  });

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
    .use(express.json({ limit: "10mb" }))
    .use(cookieParser())
    .use(express.urlencoded({ extended: false }))
    .use(
      session({
        secret: "supersecret",
        resave: true,
        saveUninitialized: true,
      })
    )
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

module.exports = {
  setupServer,
};
