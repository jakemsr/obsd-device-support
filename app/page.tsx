import prisma from "@/lib/prisma";

export default async function Home() {

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
      <h1 className="text-4xl font-bold mb-8 font-sans text-[#333333]">
        OpenBSD Device Support Database
      </h1>
      <div className="mt-4">
        <form action="/search" method="get" className="flex items-baseline gap-2">
          <label htmlFor="search">Search</label>
          <input
            type="text"
            id="search"
            name="search"
            className="mt-2 p-2 border border-gray-300 rounded"
            placeholder="Search for a device..."
          />
          <label htmlFor="bus">Bus</label>
          <select
            id="bus"
            name="bus"
            className="mt-2 p-2 border border-gray-300 rounded"
          >
            <option value="">Select Bus</option>
            <option value="PCI">PCI</option>
            <option value="USB">USB</option>
            <option value="SCSI">SCSI</option>
          </select>

          <label htmlFor="devType">Type</label>
          <select
            id="devType"
            name="devType"
            className="mt-2 p-2 border border-gray-300 rounded"
          >
            <option value="">Select Type</option>
            <option value="network/wireless">Network/Wireless</option>
            <option value="network/ethernet">Network/Ethernet</option>
            <option value="storage">Storage</option>
            <option value="audio">Audio</option>
          </select>
          <button
            type="submit"
            className="mt-4 p-2 bg-blue-500 text-white rounded"
          >
            Search
          </button>
        </form>

      </div>
      <div className="mt-4 text-sm text-gray-600">
        Quick Search:
        <a href="/search?devType=network/wireless">Network/Wireless</a>
        &nbsp;|&nbsp;
        <a href="/search?devType=network/ethernet">Network/Ethernet</a>
        &nbsp;|&nbsp;
        <a href="/search?devType=storage">Storage</a>
        &nbsp;|&nbsp;
        <a href="/search?devType=audio">Audio</a>
      </div>
    </div>
  );
}
