import type { Prisma } from "@/app/generated/prisma/client";

export type FullDeviceInfo = Prisma.devicesGetPayload<{
  include: {
    vendors: true;
    drivers: true;
    other_device_names: true;
  },
}>;

