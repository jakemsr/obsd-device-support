import { Suspense } from "react";
import SearchDevices from "../components/SearchDevices";


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
  const searchTerms = search
    ? search.trim().split(/\s+/).filter(Boolean)
    : [];

  const searchFilter = searchTerms.length
    ? {
      AND: searchTerms.map((term) => ({
        OR: [
          {
            name: {
              contains: term,
              mode: "insensitive" as const,
            },
          },
          {
            vendors: {
              is: {
                name: {
                  contains: term,
                  mode: "insensitive" as const,
                },
              },
            },
          },
          {
            other_device_names: {
              some: {
                device_name: {
                  contains: term,
                  mode: "insensitive" as const,
                },
              },
            },
          },
        ],
      })),
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


  return (
    <>
      <div className="text-center text-lg md:text-2xl font-bold mx-4 mt-4">
        Listing
        {bus && bus !== "" ? ` ${bus}` : ""}
        &nbsp;devices
        {devType && devType !== "" ? ` of type ${devType}` : ""}
        {search && search !== "" ? ` matching "${search}"` : ""}
      </div>

      <Suspense fallback={<div className="flex items-center justify-center font-bold m-8">Loading devices...</div>}>
        <SearchDevices queryWhere={queryWhere} search={search} />
      </Suspense>
    </>
  );
}
