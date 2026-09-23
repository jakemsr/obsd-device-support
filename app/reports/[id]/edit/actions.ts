'use server'

import { refresh } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth'
import { report_status, report_element_status, source_type, support_type } from '@/app/generated/prisma/enums'
import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import type { ActionState } from '@/lib/local-types'
import { normalizeDeviceId } from '@/lib/device-ids';


async function checkAuth(userId: string): Promise<boolean> {

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || !session.user || session.user.id !== userId) {
    return false;
  }

  return true;
}


export async function updateReportStatus(
  prevState: ActionState, formData: FormData
): Promise<ActionState> {

  const reportId = formData.get("reportId") as string;
  const userId = formData.get("userId") as string;
  const newStatus = formData.get("newStatus") as report_status;
  const withdrawnNote = formData.get("withdrawnNote") as string | null;

  if (!userId || !await checkAuth(userId)) {
    return {
      error: 'Unauthorized',
      success: false,
      message: 'Not logged in or doesn\'t own the report'
    };
  }

  if (!reportId || !newStatus) {
    return {
      error: 'Invalid input',
      success: false,
      message: 'Report ID or status is missing'
    };
  }

  const valid = Object.values(report_status);
  if (!valid.includes(newStatus as typeof report_status[keyof typeof report_status])) {
    return { error: 'Invalid input', success: false, message: 'Bad report status' };
  }

  try {
    await prisma.reports.update({
      where: { id: BigInt(reportId) },
      data: {
        status: newStatus as report_status,
        ...(newStatus === "withdrawn" &&
        {
          withdrawn_at: new Date(),
          withdrawn_note: withdrawnNote
        })
      },
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


export async function updateReportSource(
  prevState: ActionState, formData: FormData
): Promise<ActionState> {
  const userId = formData.get("userId") as string;
  const sourceId = formData.get("sourceId") as string;
  const reportId = formData.get("reportId") as string;
  const sourceType = formData.get("sourceType") as string;
  const sourceUrl = formData.get("sourceUrl") as string | null;
  const sourceName = formData.get("sourceName") as string | null;

  if (!userId || !await checkAuth(userId)) {
    return {
      error: 'Unauthorized',
      success: false,
      message: 'Not logged in or doesn\'t own the report'
    };
  }

  if (!reportId || !sourceId || !sourceType) {
    return {
      error: 'Invalid input',
      success: false,
      message: 'Report ID, source ID or type is missing'
    };
  }

  const valid = Object.values(source_type);
  if (!valid.includes(sourceType as typeof source_type[keyof typeof source_type])) {
    return { error: 'Invalid input', success: false, message: 'Bad source type' };
  }

  try {
    const newSource = await prisma.report_sources.create({
      data: {
        report_id: BigInt(reportId),
        source_type: sourceType as source_type,
        url: sourceUrl,
        name: sourceName,
      }
    });
    await prisma.report_sources.update({
      where: { id: BigInt(sourceId) },
      data: {
        report_element_status: report_element_status.superseded,
        report_element_status_updated_at: new Date(),
        report_element_superseded_by_id: newSource.id,
      }
    });
  } catch (err) {
    return {
      error: 'Database error',
      success: false,
      message: 'Something went wrong while updating the report source'
    };
  }

  refresh();

  return {
    error: '',
    success: true,
    message: 'Report source updated successfully'
  };
}

export async function updateReportedDevice(
  prevState: ActionState, formData: FormData
): Promise<ActionState> {

  const reportId = formData.get("reportId") as string;
  const userId = formData.get("userId") as string;
  const deviceId = formData.get("deviceId") as string;
  const bus = formData.get("bus") as string;
  const vendorId = formData.get("vendorId") as string;
  const productId = formData.get("productId") as string;
  const vendorName = formData.get("vendorName") as string;
  const productName = formData.get("productName") as string;
  const driverName = formData.get("driverName") as string;
  const supportStatus = formData.get("supportStatus") as string;
  const reportedIssues = formData.getAll("reportedIssues") as string[];
  const reportedOtherDeviceNames = formData.getAll("reportedOtherDeviceNames") as string[];

  if (!userId || !await checkAuth(userId)) {
    return {
      error: 'Unauthorized',
      success: false,
      message: 'Not logged in or doesn\'t own the report'
    };
  }

  if (!reportId || !bus || !vendorId || !productId) {
    return {
      error: 'Invalid input',
      success: false,
      message: 'Report ID, bus, vendor ID or product ID is missing'
    };
  }

  let normalizedVendorId;
  let normalizedProductId;
  try {
    normalizedVendorId = normalizeDeviceId(vendorId);
    normalizedProductId = normalizeDeviceId(productId);
  } catch (error) {
    return {
      error: 'Invalid input',
      success: false,
      message: 'Bad vendor ID or product ID'
    };
  }

  const valid = Object.values(support_type);
  if (!valid.includes(supportStatus as typeof support_type[keyof typeof support_type])) {
    return { error: 'Invalid input', success: false, message: 'Bad support status' };
  }

  try {
    const newDevice = await prisma.reported_devices.create({
      data: {
        report_id: BigInt(reportId),
        bus: bus,
        vendor_id: normalizedVendorId,
        product_id: normalizedProductId,
        reported_vendor: vendorName,
        reported_product: productName,
        reported_driver: driverName,
        support_status: supportStatus as support_type,
      }
    });
    await prisma.reported_devices.update({
      where: { id: BigInt(deviceId) },
      data: {
        report_element_status: report_element_status.superseded,
        report_element_status_updated_at: new Date(),
        report_element_superseded_by_id: newDevice.id,
      }
    });
    await prisma.reported_issues.updateMany({
      where: { id: { in: reportedIssues.map(id => BigInt(id)) } },
      data: {
        reported_device_id: newDevice.id,
      }
    });
    await prisma.reported_other_device_names.updateMany({
      where: { id: { in: reportedOtherDeviceNames.map(id => BigInt(id)) } },
      data: {
        reported_device_id: newDevice.id,
      }
    });
  } catch (err) {
    return {
      error: 'Database error',
      success: false,
      message: 'Something went wrong while updating the reported device'
    };
  }

  refresh();

  return {
    error: '',
    success: true,
    message: 'Report device updated successfully'
  };
}

export async function updateReportedIssues(
  prevState: ActionState, formData: FormData
): Promise<ActionState> {
  const userId = formData.get("userId") as string;
  const deviceId = formData.get("deviceId") as string;
  const reportedIssueCount = formData.get("reportedIssueCount") as string;
  const addedIssueCount = formData.get("addedIssueCount") as string;


  if (!userId || !await checkAuth(userId)) {
    return {
      error: 'Unauthorized',
      success: false,
      message: 'Not logged in or doesn\'t own the report'
    };
  }

  if (!deviceId || !reportedIssueCount || !addedIssueCount) {
    return {
      error: 'Invalid input',
      success: false,
      message: 'Device ID or an issue count are missing'
    };
  }

  type ReportedIssue = {
    id: string;
    text: string;
  }
  const reportedIssues: ReportedIssue[] = [];

  for (let i = 0; i < Number(reportedIssueCount); i++) {
    const id = formData.get(`reportedIssueId${i}`) as string;
    const text = formData.get(`reportedIssueText${i}`) as string;
    reportedIssues.push({ id, text });
  }
  for (let i = 0; i < Number(addedIssueCount); i++) {
    const text = formData.get(`addedIssueText${i}`) as string;
    reportedIssues.push({ id: '', text });
  }

  try {
    for (const issue of reportedIssues) {
      if (issue.text) {
        const newIssue = await prisma.reported_issues.create({
          data: {
            reported_device_id: BigInt(deviceId),
            description: issue.text,
          }
        });
        // if the issue has an id, it is an existing issue that is being superseded
        if (issue.id) {
          await prisma.reported_issues.update({
            where: { id: BigInt(issue.id) },
            data: {
              report_element_status: report_element_status.superseded,
              report_element_status_updated_at: new Date(),
              report_element_superseded_by_id: newIssue.id,
            }
          });
        }
      } else {
        // don't try to remove empty new issues
        if (issue.id) {
          await prisma.reported_issues.update({
            where: { id: BigInt(issue.id) },
            data: {
              report_element_status: report_element_status.removed,
              report_element_status_updated_at: new Date(),
            }
          });
        }
      }
    }
  } catch (err) {
    return {
      error: 'Database error',
      success: false,
      message: 'Something went wrong while updating the reported issues'
    };
  }

  refresh();

  return {
    error: '',
    success: true,
    message: 'Reported issues updated successfully'
  };
}

export async function updateReportedOtherDeviceNames(
  prevState: ActionState, formData: FormData
): Promise<ActionState> {
  const userId = formData.get("userId") as string;
  const deviceId = formData.get("deviceId") as string;
  const reportedOtherDeviceNameCount = formData.get("reportedOtherDeviceNameCount") as string;
  const addedOtherDeviceNameCount = formData.get("addedOtherDeviceNameCount") as string;


  if (!userId || !await checkAuth(userId)) {
    return {
      error: 'Unauthorized',
      success: false,
      message: 'Not logged in or doesn\'t own the report'
    };
  }

  if (!deviceId || !reportedOtherDeviceNameCount || !addedOtherDeviceNameCount) {
    return {
      error: 'Invalid input',
      success: false,
      message: 'Device ID or a reported other device name count are missing'
    };
  }

  type ReportedDeviceName = {
    id: string;
    vendor: string;
    product: string;
  }
  const reportedOtherDeviceNames: ReportedDeviceName[] = [];

  for (let i = 0; i < Number(reportedOtherDeviceNameCount); i++) {
    const id = formData.get(`reportedOtherDeviceNameId${i}`) as string;
    const vendor = formData.get(`reportedOtherDeviceNameVendorText${i}`) as string;
    const product = formData.get(`reportedOtherDeviceNameProductText${i}`) as string;
    reportedOtherDeviceNames.push({ id, vendor, product });
  }
  for (let i = 0; i < Number(addedOtherDeviceNameCount); i++) {
    const vendor = formData.get(`addedOtherDeviceNameVendor${i}`) as string;
    const product = formData.get(`addedOtherDeviceNameProduct${i}`) as string;
    reportedOtherDeviceNames.push({ id: '', vendor, product });
  }

  try {
    for (const name of reportedOtherDeviceNames) {
      if (name.vendor || name.product) {
        const newName = await prisma.reported_other_device_names.create({
          data: {
            reported_device_id: BigInt(deviceId),
            vendor_name: name.vendor,
            product_name: name.product,
          }
        });
        // if the name has an id, it is an existing product that is being superseded
        if (name.id) {
          await prisma.reported_other_device_names.update({
            where: { id: BigInt(name.id) },
            data: {
              report_element_status: report_element_status.superseded,
              report_element_status_updated_at: new Date(),
              report_element_superseded_by_id: newName.id,
            }
          });
        }
      } else {
        // if the name has an id but no vendor or product, it is being removed
        if (name.id) {
          await prisma.reported_other_device_names.update({
            where: { id: BigInt(name.id) },
            data: {
              report_element_status: report_element_status.removed,
              report_element_status_updated_at: new Date(),
            }
          });
        }
      }
    }
  } catch (err) {
    return {
      error: 'Database error',
      success: false,
      message: 'Something went wrong while updating the reported other device names'
    };
  }

  refresh();

  return {
    error: '',
    success: true,
    message: 'Reported other device names updated successfully'
  };
}
