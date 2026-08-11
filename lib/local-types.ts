import type { Prisma } from "@/app/generated/prisma/client";

export type DeviceWithVendorAndDriver = Prisma.devicesGetPayload<{
  include: {
    vendors: true;
    drivers: true;
  },
}>;

