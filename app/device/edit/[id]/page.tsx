import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { FullDeviceInfo } from "@/lib/local-types";
import prisma from "@/lib/prisma";
import EditDevice from "@/app/components/devices/EditDevice";

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || !session.user || session.user.role !== "editor") {
    return (<h1>Not logged in or not editor</h1>);
  }

  const device: FullDeviceInfo | null = await prisma.devices.findUnique({
    where: { id: BigInt(id) },
    include: {
      vendors: true,
      drivers: true,
      issues: true,
      other_device_names: true,
    },
  });

  if (!device) {
    return (
      <div>
        Device not found
      </div>
    );
  }

  return (
    <div>
      Edit Device Page
      <div>
        Bus: {device.bus}
      </div>
      <div>
        VID / PID: {device.bus === "USB" ? device.vendors.usb_id : device.vendors.pci_id} / {device.product_id}
      </div>
      <div>
        Name {device.vendors.name} {device.name}
      </div>

      <EditDevice device={device} />

    </div>
  );
}
