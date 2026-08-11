import prisma from "@/lib/prisma";
import Link from "next/link";
import DeviceCard from "./DeviceCard";


interface SearchDevicesProps {
  queryWhere: any;
  currentPage: number;
  pageSize: number;
  search?: string;
  bus?: string;
  devType?: string;
}

export default async function SearchDevices({ queryWhere, currentPage, pageSize, search, bus, devType }: SearchDevicesProps) {

  const [devices, totalCount] = await Promise.all([
    prisma.devices.findMany({
      where: queryWhere,
      orderBy: {
        id: "asc",
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: {
        vendors: true,
        drivers: true,
      },
    }),
    prisma.devices.count({
      where: queryWhere,
    }),
  ]);

  const hasNextPage = currentPage * pageSize < totalCount;
  const hasPreviousPage = currentPage > 1;

  const buildPageHref = (targetPage: number) => {
    const queryParams = new URLSearchParams();
    if (search) queryParams.set("search", search);
    if (bus) queryParams.set("bus", bus);
    if (devType) queryParams.set("devType", devType);
    queryParams.set("page", targetPage.toString());
    return `/search?${queryParams.toString()}`;
  };

  const previousPageHref = hasPreviousPage ? buildPageHref(currentPage - 1) : undefined;
  const nextPageHref = hasNextPage ? buildPageHref(currentPage + 1) : undefined;

  const firstPageHref = buildPageHref(1);
  const lastPageHref = buildPageHref(Math.ceil(totalCount / pageSize));

  return (
    <>
      <div>
        <div className="flex items-center justify-center font-bold mt-4">
          {totalCount === 0 ? (
            <div>No devices found.</div>
          ) : (
            <div>
              Found {totalCount} device{totalCount !== 1 ? "s" : ""}.
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 items-center justify-between text-sm text-blue-700 mx-8 mt-2">

        <div>
          {previousPageHref ? (
            <div className="flex flex-col sm:flex-row-reverse gap-2 sm:gap-4">
              <Link href={previousPageHref}>Previous page</Link>
              <Link href={firstPageHref}>First page</Link>
            </div>
          ) : (
            <div></div>
          )}
        </div>

        <div>
          {nextPageHref ? (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Link href={nextPageHref}>Next page</Link>
              <Link href={lastPageHref}>Last page</Link>
            </div>
          ) : (
            <div></div>
          )}
        </div>

      </div>
      <div>
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </>
  );
}
