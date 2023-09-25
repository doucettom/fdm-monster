import { FloorPosition } from "@/entities/mikro/FloorPosition";
import { MikroORM } from "@mikro-orm/better-sqlite";
import { Floor, Printer } from "@/entities/mikro";
import { AppConstants } from "@/server.constants";

console.log("Running test sqlite with MikroORM");

process.env[AppConstants.DATABASE_FILE] = ":memory:";

async function main() {
  const orm = await MikroORM.init();
  // orm.config.set("dbName", "test.sqlite");
  const em = orm.em.fork();

  console.log("Running migrations...");
  await orm.getMigrator().up();

  console.log("Running test...");
  const printerRepository = em.getRepository(Printer);
  const floorRepository = em.getRepository(Floor);
  const floorPositionRepository = em.getRepository(FloorPosition);
  let floor = await floorRepository.findOne({
    floor: 2,
  });
  if (!floor) {
    console.log("Creating default floor...");
    floor = floorRepository.create(new Floor("Default Floor", 2));
  }

  const floor2 = floorRepository.create(new Floor("Default Floor2", 3));
  const newPrinter = printerRepository.create({
    name: "Default Printer",
    printerURL: "http://localhost:3000",
    apiKey: "1234567890",
    enabled: true,
    disabledReason: null,
  });

  const pos = floorPositionRepository.create(new FloorPosition(0, 0, newPrinter, floor2));

  console.log("Flushing... pos printerId", pos.printer.id);
  await em.persistAndFlush([floor, newPrinter, pos]);

  const position = await floorPositionRepository.findOneOrFail({ printer: newPrinter.id, floor: floor2.id });
  console.log("Position found", position.x, position.y, position.printer.id, position.floor.id);

  const floorResult = await floorRepository.findOneOrFail({ id: floor2.id }, { populate: ["positions"] });
  const position0 = floorResult.positions?.length ? floorResult.positions[0] : null;
  console.log(
    "Position found",
    position0?.x,
    position0?.y,
    position0?.printer.id,
    position0?.printerId,
    position0?.floorId,
    position0?.floor.id
  );
}

main().then(() => {
  console.log("Done!");
  // process.exit(0);
});
