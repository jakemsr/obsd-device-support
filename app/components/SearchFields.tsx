import Link from "next/link";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";


// get device types from public.drivers table
const getDeviceTypes = unstable_cache(
  async function getDeviceTypes(): Promise<string[]> {
    const deviceTypes = await prisma.drivers.findMany({
      distinct: ["dev_type"],
      select: {
        dev_type: true,
      },
    });

    return deviceTypes.map((driver) => driver.dev_type);
  },
  ['homepage'], // cache key
  {
    tags: ['homepage'],
    revalidate: 60, // revalidate every 60 seconds
  }
)

// get unique bus types from public.devices table
const getBusTypes = unstable_cache(
  async function getBusTypes(): Promise<string[]> {
    const busTypes = await prisma.devices.findMany({
      distinct: ["bus"],
      select: {
        bus: true,
      },
    });

    return busTypes.map((device) => device.bus);
  },
  ['homepage'], // cache key
  {
    tags: ['homepage'],
    revalidate: 60, // revalidate every 60 seconds
  }
);


export default async function SearchFields() {
  const deviceTypes = await getDeviceTypes();
  const busTypes = await getBusTypes();

  return (
    <>
      <div className="mt-4">
        <form action="/search" method="get" className="flex flex-col md:flex-row items-center gap-2">
          <div className="flex gap-2 items-center">
            <label htmlFor="search">Search</label>
            <input
              type="text"
              id="search"
              name="search"
              className="p-2 border border-gray-300 rounded"
              placeholder="Search a device name..."
              autoFocus
            />
          </div>
          <div className="flex gap-2 items-center">
            <label htmlFor="bus">Bus</label>
            <select
              id="bus"
              name="bus"
              className="p-2 border border-gray-300 rounded"
            >
              <option value="">Select Bus</option>
              {busTypes.map((busType) => (
                <option key={busType} value={busType}>
                  {busType}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 items-center">

            <label htmlFor="devType">Type</label>
            <select
              id="devType"
              name="devType"
              className="p-2 border border-gray-300 rounded"
            >
              <option value="">Select Type</option>
              {deviceTypes.map((deviceType) => (
                <option key={deviceType} value={deviceType}>
                  {deviceType}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded"
            >
              Search
            </button>
          </div>
        </form>

      </div>
      <div className="mt-4 text-sm">
        Quick Search:&nbsp;
        {deviceTypes.map((deviceType, index) => (
          <span key={deviceType}>
            <Link
              href={`/search?devType=${encodeURIComponent(deviceType)}`}
              className="text-link hover:underline"
            >
              {deviceType}
            </Link>
            {index < deviceTypes.length - 1 && " | "}
          </span>
        ))}
      </div>
    </>
  );
}