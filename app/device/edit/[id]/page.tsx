import prisma from "@/lib/prisma";
import EditDevice from "@/app/components/device/EditDevice";
import { getCurrentUser } from "@/lib/check-user-auth";
import type { AuthUser, FullDeviceInfo } from "@/lib/local-types";
import { Suspense } from "react";


export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params;

  const currentUser: AuthUser | null = await getCurrentUser();

  if (!currentUser || currentUser.role !== "editor") {
    return (
      <div className="px-4">
        Not logged in or not editor
      </div>
    );
  }

  const devicePromise: Promise<FullDeviceInfo | null> = prisma.devices.findUnique({
    where: { id: BigInt(id) },
    include: {
      vendors: true,
      drivers: true,
      issues: true,
      other_device_names: true,
    },
  });

  return (
    <div className="px-4">
      <h1 className="text-2xl font-bold mb-4">
        Edit Device {id}
      </h1>

      <Suspense fallback={<div>Loading device...</div>}>
        <EditDevice devicePromise={devicePromise} />
      </Suspense>

    </div>
  );
}
