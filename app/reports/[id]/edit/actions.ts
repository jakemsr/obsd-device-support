'use server'

import { refresh } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth'
import type { report_status } from '@/app/generated/prisma/enums'
import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import type { ActionState, FullDeviceInfo, FullReport } from '@/lib/local-types'


export async function updateReportStatus(
  prevState: ActionState, formData: FormData
): Promise<ActionState> {

  const reportId = formData.get("reportId") as string;
  const userId = formData.get("userId") as string;
  const newStatus = formData.get("newStatus") as report_status;

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || !session.user ||
    !(session.user.role === "editor" || session.user.id === userId)) {
    return {
      error: 'Unauthorized',
      success: false,
      message: 'Doesn\'t own the report or not an editor'
    };
  }

  if (!reportId || !newStatus) {
    return {
      error: 'Invalid input',
      success: false,
      message: 'Report ID or status is missing'
    };
  }

  try {
    await prisma.reports.update({
      where: { id: BigInt(reportId) },
      data: { status: newStatus },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return {
          error: "Not found",
          success: false,
          message: "The report does not exist.",
        };
      }
    }
    return {
      error: 'Database error',
      success: false,
      message: 'Something went wrong while updating the report status'
    };
  }

  refresh();
  
  return {
    error: '',
    success: true,
    message: 'Report status updated successfully'
  };
}


export async function getMatchedDevices(report: FullReport) {

  const matchMap = new Map<bigint, FullDeviceInfo[]>();

  const matchedEntries = await Promise.all(
    report.reported_devices.map(async (device) => {
      const devices: FullDeviceInfo[] = await prisma.devices.findMany({
        where: {
          product_id: "0x" + device.product_id,
          bus: device.bus,
          vendors: {
            [device.bus === "PCI" ? "pci_id" : "usb_id"]: "0x" + device.vendor_id,
          },
        },
        include: {
          vendors: true,
          drivers: true,
          issues: true,
          other_device_names: true,
        },
        orderBy: { name: "asc" },
      });

      return [device.id, devices] as const;
    })
  );

  for (const [deviceId, devices] of matchedEntries) {
    matchMap.set(deviceId, devices);
  }

  return matchMap;

}