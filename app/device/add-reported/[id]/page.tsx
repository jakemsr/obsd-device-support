import prisma from "@/lib/prisma";

export default async function Page({ params }: { params: Promise<{ id: string }> } ) {
  const { id } = await params;

  const device = await prisma.reported_devices.findFirst({
    where: { id: BigInt(id) }
  });

  if (!device) return <div>Device not found</div>

  return (
    <div className="px-4">
      <h1 className="font-bold text-2xl text-center">
        Add reported device
      </h1>
      <div>Device info: {device.reported_vendor} {device.reported_product}</div>
    </div>
  )
}
