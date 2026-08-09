import prisma from "@/lib/prisma";


// get device types from public.drivers table
async function getDeviceTypes(): Promise<string[]> {
  const deviceTypes = await prisma.drivers.findMany({
    distinct: ["dev_type"],
    select: {
      dev_type: true,
    },
  });

  return deviceTypes.map((driver) => driver.dev_type);
}

// get unique bus types from public.devices table
async function getBusTypes(): Promise<string[]> {
  const busTypes = await prisma.devices.findMany({
    distinct: ["bus"],
    select: {
      bus: true,
    },
  });

  return busTypes.map((device) => device.bus);
}

const deviceTypes = await getDeviceTypes();
const busTypes = await getBusTypes();


export default function Home() {

  return (
    <div className="min-h-svh flex flex-col items-center justify-center">
      <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-8 font-sans">
        OpenBSD Device Support Database
      </h1>
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
      <div className="mt-4 text-sm text-gray-600">
        Quick Search:&nbsp;
        {deviceTypes.map((deviceType, index) => (
          <span key={deviceType}>
            <a href={`/search?devType=${encodeURIComponent(deviceType)}`}>{deviceType}</a>
            {index < deviceTypes.length - 1 && " | "}
          </span>
        ))}
      </div>
    </div>
  );
}
