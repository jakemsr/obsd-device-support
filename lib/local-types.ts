import type { Prisma } from "@/app/generated/prisma/client";

export type FullDeviceInfo = Prisma.devicesGetPayload<{
  include: {
    vendors: true;
    drivers: true;
    other_device_names: true;
  },
}>;

export type DeviceListEntryProps = {
  id: bigint;
  name: string;
  devType: string;
  bus: string;
  vid: string;
  pid: string;
}

export type UserInfo = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: Date;
};
