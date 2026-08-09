import prisma from "@/lib/prisma";
import DeviceCard from "@/app/components/DeviceCard";
import Link from "next/link";


export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await the searchParams promise
  const filters = await searchParams;

  // Access specific query values
  const search = typeof filters.search === "string" ? filters.search : undefined;
  const bus = typeof filters.bus === "string" ? filters.bus : undefined;
  const devType = typeof filters.devType === "string" ? filters.devType : undefined;
  const rawPage = typeof filters.page === "string"
    ? filters.page
    : Array.isArray(filters.page)
      ? filters.page[0]
      : undefined;
  const currentPage = rawPage ? Math.max(1, Number.parseInt(rawPage, 10)) : 1;
  const pageSize = 5;

  const searchFilter = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            vendors: {
              is: {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            },
          },
        ],
      }
    : {};

  const baseWhere = {
    ...searchFilter,
    ...(bus ? { bus } : {}),
  };

  const queryWhere = devType
    ? {
        ...baseWhere,
        drivers: {
          dev_type: devType,
        },
      }
    : baseWhere;

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

  return (
    <div>
      <div className="flex items-center justify-center text-lg font-bold m-8">
        Listing 
        {bus && bus !== "" ? ` ${bus}` : ""}
        &nbsp;devices
        {devType && devType !== "" ? ` of type ${devType}` : ""}
        {search && search !== "" ? ` matching "${search}"` : ""}
      </div>
        <div className="flex justify-between m-8 items-center">
          {previousPageHref ? (
            <Link href={previousPageHref}>Previous page</Link>
          ) : <>&nbsp;</>}
          {nextPageHref ? (
            <Link href={nextPageHref}>Next page</Link>
          ) : <>&nbsp;</>}
        </div>
      <div>
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </div>
  );
}
