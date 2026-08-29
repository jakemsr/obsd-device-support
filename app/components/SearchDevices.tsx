import prisma from "@/lib/prisma";
import ListDevices from "./ListDevices";
import { Prisma } from "../generated/prisma/client";


interface SearchDevicesProps {
  queryWhere: Prisma.devicesWhereInput;
  search?: string;
}

export default async function SearchDevices({queryWhere, search}: SearchDevicesProps) {

  const devices = await
    prisma.devices.findMany({
      where: queryWhere,
      orderBy: [
        { name: "asc" },
        { vendors: { name: "asc" } },
        { dev_id: "asc" },
      ],
      include: {
        vendors: true,
        drivers: true,
        other_device_names: true,
      },
    });

  return (
    <ListDevices
      devices={devices}
      search={search}
    />
  )

}