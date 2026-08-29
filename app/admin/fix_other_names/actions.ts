import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";


export interface OtherName {
  id: bigint;
  device_name: string;
  device_id: bigint;
  vendor_name: string;
}

export async function getOtherNames(): Promise<OtherName[]> {
  const other_names = await prisma.other_device_names.findMany({
    orderBy: {
      device_name: "asc"
    }
  });
  return other_names;
}

export type OtherNameWithDevice = Prisma.other_device_namesGetPayload<{
  include: {
    devices: {
      include: {
        vendors: true
      }
    }
  },
}>;

export async function getOtherNameById(id: bigint): Promise<OtherNameWithDevice | null> {
  const other_name = await prisma.other_device_names.findUnique({
    where: {
      id: id
    },
    include: {
      devices: {
        include: {
          vendors: true
        }
      }
    },
  });
  return other_name;
}
