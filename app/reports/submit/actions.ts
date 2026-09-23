'use server'

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { ActionState } from '@/lib/local-types';
import prisma from '@/lib/prisma';
import { support_type } from '@/app/generated/prisma/browser';
import { Prisma } from "@/app/generated/prisma/client";
import { normalizeDeviceId } from '@/lib/device-ids';


export async function checkAuth(): Promise<string | null> {

  const session = await auth.api.getSession({
      headers: await headers()
    });
  
    if (!session || !session.user) {
      return null;
    }
  
    return session.user.id;
}

export async function reportSumbission(
  prevState: ActionState, formData: FormData
): Promise<ActionState> {
  const userId = formData.get("user_id") as string;
  const bus = formData.get("bus") as string;
  const vendorId = formData.get("vendor_id") as string;
  const productId = formData.get("product_id") as string;
  const reportedVendor = formData.get("reported_vendor") as string;
  const reportedProduct = formData.get("reported_product") as string;
  const reportedDriver = formData.get("reported_driver") as string;
  const supportStatus = formData.get("support_status") as string;

  const numIssues = formData.get("numIssues") as string;
  const issues: string[] = [];
  for (let i = 0; i < parseInt(numIssues); i++) {
    issues.push(formData.get(`issue${i}`) as string);
  }

  const numOtherNames = formData.get("numOtherNames") as string;
  const otherNames: { vendor: string; product: string }[] = [];
  for (let i = 0; i < parseInt(numOtherNames); i++) {
    otherNames.push({
      vendor: formData.get(`otherNameVendor${i}`) as string,
      product: formData.get(`otherNameProduct${i}`) as string
    });
  }

  const checkUserId = await checkAuth();
  if (!checkUserId || checkUserId !== userId) {
    console.log("checkID: ", checkUserId, " userId:", userId)
    return {
      error: 'Unauthorized',
      success: false,
      message: 'You are not authorized to submit this report'
    };
  }

  if (!userId || !bus || !vendorId || !productId || !reportedVendor || !reportedProduct || !reportedDriver || !supportStatus) {
    return {
      error: 'Missing fields',
      success: false,
      message: 'Please fill in all required fields'
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

  // validate support status
  if (!Object.values(support_type).includes(supportStatus as support_type)) {
    return {
      error: 'Invalid support status',
      success: false,
      message: 'The support status provided is not valid'
    };
  }

  try {
    // create parent report
    const report = await prisma.reports.create({
      data: { user_id: userId },
    });
    console.log("Created report with ID: ", report.id);

    // create report sources
    const reportSource = await prisma.report_sources.create({
      data: {
        report_id: report.id,
        source_type: 'observation',
        name: 'Form Report',
        url: 'localhost',
      }
    });
    console.log("Created report source with ID: ", reportSource.id);

    // create form_report
    const formReport = await prisma.form_reports.create({
      data: {
        report_source_id: reportSource.id,
        url: "localhost",
        collected_at: new Date(),
        payload: JSON.stringify(Object.fromEntries(formData.entries())),
      }
    });
    console.log("Created form report with ID: ", formReport.id);


    // create reported device
    const reportedDevice = await prisma.reported_devices.create({
      data: {
        report_id: report.id,
        bus: bus,
        vendor_id: normalizedVendorId,
        product_id: normalizedProductId,
        reported_vendor: reportedVendor,
        reported_product: reportedProduct,
        reported_driver: reportedDriver,
        support_status: supportStatus as support_type        
      }
    });
    console.log("Created reported device with ID: ", reportedDevice.id);

    // create reported issues
    for (const issue of issues) {
      const reportedIssue = await prisma.reported_issues.create({
        data: {
          reported_device_id: reportedDevice.id,
          description: issue,
        }
      });
      console.log("Created reported issue with ID: ", reportedIssue.id);
    }

    // create reported other device names
    for (const otherName of otherNames) {
      const reportedOtherDeviceName = await prisma.reported_other_device_names.create({
        data: {
          reported_device_id: reportedDevice.id,
          vendor_name: otherName.vendor,
          product_name: otherName.product,
        }
      });
      console.log("Created reported other device name with ID: ", reportedOtherDeviceName.id);
    }
  } catch (error) {
    return {
      error: 'Database error',
      success: false,
      message: 'Failed to create report'
    };
  }

  return {
    error: '',
    success: true,
    message: 'Report submitted successfully'
  };
}
