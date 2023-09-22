import { FloorPosition } from "@/entities/FloorPosition";

console.log("Running test-sqlite.ts");
import { MikroORM } from "@mikro-orm/better-sqlite";
import { Floor, Printer } from "@/entities";
import { AppConstants } from "@/server.constants";

// process.env[AppConstants.DATABASE_PATH] = "./database-test";
process.env[AppConstants.DATABASE_FILE] = ":memory:";

async function main() {
  const orm = await MikroORM.init();
  orm.config.set("dbName", "test.sqlite");
  const em = orm.em.fork();

  console.log("Running migrations...");
  await orm.getMigrator().up();

  console.log("Running test...");
  const printerRepository = em.getRepository(Printer);
  const floorRepository = em.getRepository(Floor);
  let floor = await floorRepository.findOne({
    floor: 2,
  });
  if (!floor) {
    console.log("Creating default floor...");
    floor = floorRepository.create(new Floor("Default Floor", 2));
  }
  const newPrinter = printerRepository.create({
    name: "Default Printer",
    printerURL: "http://localhost:3000",
    apiKey: "1234567890",
    enabled: true,
    disabledReason: null,
  });
  floor.positions.add(new FloorPosition(0, 0, newPrinter.id, floor.id));
  console.log("Flushing...", floor.positions[0].printerId);
  await em.flush();
}

main().then(() => {
  console.log("Done!");
  process.exit(0);
});
