import { prisma } from "../../data/prisma.ts";
import { registry } from "./registry.ts";

const seeds = [
  { name: "owner", run: registry.owner },
  { name: "achievements", run: registry.achievements },
  { name: "magicCards", run: registry.magicCards },
];

try {
  console.log("Starting global seed...");

  for (const seed of seeds) {
    if (process.env.NODE_ENV === "prod" && seed.name == "magicCards") {
      continue;
    }
    console.log(`Running: ${seed.name}...`);
    await seed.run();
    console.log(`${seed.name} completed.`);
  }

  console.log("All seeds executed successfully!");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
  console.log("Prisma connection closed.");
}
