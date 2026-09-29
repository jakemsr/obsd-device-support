'use server'

import { refresh } from "next/cache";
import { support_type } from "@/app/generated/prisma/browser";
import { ActionState } from "@/lib/local-types";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/check-user-auth";

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
  const addedIssuesCount = data.get("added_issues_count") as string;
  const otherNamesCount = data.get("other_device_names_count") as string;
  const addedOtherNamesCount = data.get("added_other_device_name_count") as string;

  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "editor") {
    return {
      error: "Unauthorized",
      success: false,
      message: "Not logged in or not editor"
    }
  }

  if (!deviceId || !supportStatus || !driverId ||
    !issuesCount || !addedIssuesCount ||
    !otherNamesCount || !addedOtherNamesCount) {
    return {
      error: "Invalid input",
      success: false,
      message: "Missing fields"
    }
  }

  type Issue = {
    id: string;
    text: string;
  };

  const issues: Issue[] = [];
  for (let i = 0; i < Number(issuesCount); i++) {
    const issueId = data.get(`issue_id_${i}`) as string;
    const issueText = data.get(`issue_text_${i}`) as string;
    issues.push({ id: issueId, text: issueText });
  }
  for (let i = 0; i < Number(addedIssuesCount); i++) {
    const issueId = "";
    const issueText = data.get(`added_issue_text_${i}`) as string;
    issues.push({ id: issueId, text: issueText });
  }

  type OtherName = {
    id: string;
    vendor: string;
    product: string;
  };

  const otherNames: OtherName[] = [];
  for (let i = 0; i < Number(otherNamesCount); i++) {
    const otherNameId = data.get(`other_device_name_id_${i}`) as string;
    const vendor = data.get(`other_device_name_vendor_text_${i}`) as string;
    const product = data.get(`other_device_name_product_text_${i}`) as string;
    otherNames.push({ id: otherNameId, vendor, product });
  }
  for (let i = 0; i < Number(addedOtherNamesCount); i++) {
    const otherNameId = "";
    const vendor = data.get(`added_other_device_name_vendor_${i}`) as string;
    const product = data.get(`added_other_device_name_product_${i}`) as string;
    otherNames.push({ id: otherNameId, vendor, product });
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
      },
    });
    for (const issue of issues) {
      if (issue.text) {
        await prisma.issues.upsert({
          where: { id: BigInt(issue.id) },
          update: { description: issue.text },
          create: {
            description: issue.text,
            dev_id: BigInt(deviceId)
          }
        });
      } else if (issue.id) {
        await prisma.issues.delete({
          where: { id: BigInt(issue.id) }
        });
      }
    }
    for (const otherName of otherNames) {
      if (otherName.vendor || otherName.product) {
        await prisma.other_device_names.upsert({
          where: { id: BigInt(otherName.id) },
          update: { vendor_name: otherName.vendor, device_name: otherName.product },
          create: {
            vendor_name: otherName.vendor,
            device_name: otherName.product,
            device_id: BigInt(deviceId)
          }
        });
      } else if (otherName.id) {
        await prisma.other_device_names.delete({
          where: { id: BigInt(otherName.id) }
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
