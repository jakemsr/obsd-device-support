// lib/test-prisma.ts

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.TEST_DATABASE_URL;

if (!connectionString) {
  throw new Error("TEST_DATABASE_URL is not set");
}

const adapter = new PrismaPg({
  connectionString,
});

const testPrisma = new PrismaClient({
  adapter,
});

export default testPrisma;
