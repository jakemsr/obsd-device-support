import prisma from "@/lib/prisma";
import EditDevice from "@/app/components/devices/EditDevice";
import { getCurrentUser } from "@/lib/check-user-auth";
import type { AuthUser, FullDeviceInfo } from "@/lib/local-types";


export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params;

  const currentUser: AuthUser | null = await getCurrentUser();

  if (!currentUser || currentUser.role !== "editor") {
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
