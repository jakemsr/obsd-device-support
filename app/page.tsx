import prisma from "@/lib/prisma";

export default async function Home() {
  const vendors = await prisma.vendors.findMany();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
      <h1 className="text-4xl font-bold mb-8 font-sans text-[#333333]">
        Superblog
      </h1>
      <ol className="list-decimal list-inside font-sans">
        {vendors.map((vendor) => (
          <li key={vendor.id} className="mb-2">
            {vendor.name}
            {vendor.usb_id}
          </li>
        ))}
      </ol>
    </div>
  );
}
