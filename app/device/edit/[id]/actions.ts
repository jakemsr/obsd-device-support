'use server'

import prisma from "@/lib/prisma";

type DriverListEntry = {
  id: bigint;
  name: string;
}

async function getDriverList(): Promise<DriverListEntry[]> {
  const drivers = await prisma.drivers.findMany();
  return drivers.map(driver => ({ id: driver.id, name: driver.name }));
}

export { getDriverList, type DriverListEntry };
