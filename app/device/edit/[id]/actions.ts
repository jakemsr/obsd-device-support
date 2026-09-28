'use server'

import { refresh } from "next/cache";
import { support_type } from "@/app/generated/prisma/browser";
import { ActionState } from "@/lib/local-types";
import prisma from "@/lib/prisma";

type DriverListEntry = {
  id: bigint;
  name: string;
}

async function getDriverList(): Promise<DriverListEntry[]> {
  const drivers = await prisma.drivers.findMany();
  return drivers.map(driver => ({ id: driver.id, name: driver.name }));
}

async function updateDevice(data: FormData): Promise<ActionState> {
  const deviceId = data.get("device_id") as string;
  const supportStatus = data.get("support_status") as string;
  const driverId = data.get("driver_id") as string;
  const issuesCount = data.get("issues_count") as string;

  const issues = [];
  for (let i = 0; i < Number(issuesCount); i++) {
    const issueId = data.get(`issue_id_${i}`) as string;
    const issueText = data.get(`issue_text_${i}`) as string;
    issues.push({ id: issueId, description: issueText });
  }

  // validate support supportStatus as support_type
  let validSupportStatus = undefined;
  for (const status of Object.values(support_type)) {
    if (status === supportStatus) {
      validSupportStatus = status;
      break;
    }
  }
  if (!validSupportStatus) {
    return {
      success: false,
      error: "Invalid support status",
      message: "Failed to update device"
    }
  }

  try {
    await prisma.devices.update({
      where: { id: BigInt(deviceId) },
      data: {
        support_status: validSupportStatus,
        driver_id: BigInt(driverId),
      }
    });
    for (const issue of issues) {
      if (issue.description) {
        await prisma.issues.upsert({
          where: { id: BigInt(issue.id) },
          update: { description: issue.description },
          create: {
            description: issue.description,
            dev_id: BigInt(deviceId)
          }
        });
      } else if (issue.id) {
        await prisma.issues.delete({
          where: { id: BigInt(issue.id) }
        });
      }
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
      message: "Failed to update device"
    }
  }

  refresh();

  return {
    success: true,
    error: "",
    message: "Device updated successfully"
  }
}


export { getDriverList, type DriverListEntry, updateDevice };
