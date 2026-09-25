'use server';

import type { FullDeviceInfo, FullReport } from '@/lib/local-types';
import prisma from "@/lib/prisma";


export async function getFullReport(id: string) {
  const report: FullReport | null = await prisma.reports.findUnique({
    where: {
      id: BigInt(id),
    },
    include: {
      sources: {
        where: {
          report_element_status: "current",
        },
        include: {
          hwinspect_report: true,
          form_report: true,
        },
      },
      reported_devices: {
        where: {
          report_element_status: "current",
        },
        include: {
          reported_issues: {
            where: { report_element_status: "current" },
          },
          reported_other_device_names: {
            where: { report_element_status: "current" },
          },
        }
      }
    }
  });

  return report;
}


export async function getMatchedDevices(report: FullReport) {

  const matchMap = new Map<bigint, FullDeviceInfo[]>();

  const matchedEntries = await Promise.all(
    report.reported_devices.map(async (device) => {
      const devices: FullDeviceInfo[] = await prisma.devices.findMany({
        where: {
          product_id: device.product_id,
          bus: device.bus,
          vendors: {
            [device.bus === "PCI" ? "pci_id" : "usb_id"]: device.vendor_id,
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
