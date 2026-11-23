'use server'

import { ActionResult } from '@/lib/local-types';
import prisma from '@/lib/prisma';
import { source_type, support_type } from '@/app/generated/prisma/browser';
import { getUserId } from '@/lib/check-user-auth';
import { z } from 'zod';
import {
  formatFieldName,
  requiredString,
  deviceIdSchema,
  countSchema
} from '@/lib/zod-helpers';


const reportSchema = z.object({
  user_id: requiredString,
  reason: requiredString,
  bus: z.enum(['USB', 'PCI']),
  vendor_id: requiredString.pipe(deviceIdSchema),
  product_id: requiredString.pipe(deviceIdSchema),
  reported_vendor: requiredString,
  reported_product: requiredString,
  reported_driver: z.string().nullable(),
  support_status: z.enum(support_type),
  source_name: z.string().nullable(),
  source_type: z.enum(source_type),
  source_url: z.string().nullable(),
  issues: z.array(z.string()),
  otherNames: z.array(z.object({
    vendor: z.string(),
    product: z.string(),
  })),
});

export async function reportSubmission(formData: FormData): Promise<ActionResult<string>> {

  const entries = Array.from(formData.entries());
  const counts = z.object({
    numIssues: countSchema,
    numOtherNames: countSchema,
  }).safeParse({
    numIssues: formData.get("numIssues"),
    numOtherNames: formData.get("numOtherNames"),
  });
  if (!counts.success ||
    counts.data.numIssues > entries.length ||
    counts.data.numOtherNames > entries.length ||
    !z.array(z.tuple([z.string(), z.string()])).safeParse(entries).success) {
    return {
      ok: false,
      error: "Invalid form fields or field counts"
    };
  }

  const result = reportSchema.safeParse({
    user_id: formData.get("user_id"),
    reason: formData.get("reason"),
    bus: formData.get("bus"),
    vendor_id: formData.get("vendor_id"),
    product_id: formData.get("product_id"),
    reported_vendor: formData.get("reported_vendor"),
    reported_product: formData.get("reported_product"),
    reported_driver: formData.get("reported_driver"),
    support_status: formData.get("support_status"),
    source_name: formData.get("source_name"),
    source_type: formData.get("source_type"),
    source_url: formData.get("source_url"),
    issues: Array.from({ length: counts.data.numIssues }, (_, i) => formData.get(`issue${i}`)),
    otherNames: Array.from({ length: counts.data.numOtherNames }, (_, i) => ({
      vendor: formData.get(`otherNameVendor${i}`),
      product: formData.get(`otherNameProduct${i}`),
    })),
  });
  if (!result.success) {
    const issue = result.error.issues[0];
    return {
      ok: false,
      error: `${formatFieldName(issue.path)}: ${issue.message}`
    };
  }

  const { user_id, reason, bus, vendor_id, product_id, reported_vendor, reported_product,
    reported_driver, support_status, source_name, source_type, source_url,
    issues, otherNames } = result.data;

  const userId = user_id;
  if (!userId || userId !== await getUserId()) {
    return {
      ok: false,
      error: "Access denied"
    };
  }

  try {
    // create parent report
    const report = await prisma.reports.create({
      data: {
        user_id: userId,
        reason: reason,
      },
    });

    // create report sources
    const reportSource = await prisma.report_sources.create({
      data: {
        report_id: report.id,
        source_type: source_type,
        name: source_name,
        url: source_url,
      }
    });

    // create form_report
    await prisma.form_reports.create({
      data: {
        report_source_id: reportSource.id,
        url: "localhost",
        collected_at: new Date(),
        payload: JSON.stringify(Object.fromEntries(formData.entries())),
      }
    });

    // create reported device
    const reportedDevice = await prisma.reported_devices.create({
      data: {
        report_id: report.id,
        bus: bus,
        vendor_id: vendor_id,
        product_id: product_id,
        reported_vendor: reported_vendor,
        reported_product: reported_product,
        reported_driver: reported_driver,
        support_status: support_status,
      }
    });

    // create reported issues
    for (const issue of issues) {
      if (!issue) continue;
      await prisma.reported_issues.create({
        data: {
          reported_device_id: reportedDevice.id,
          description: issue,
        }
      });
    }

    // create reported other device names
    for (const otherName of otherNames) {
      if (!otherName.vendor && !otherName.product) continue;
      await prisma.reported_other_device_names.create({
        data: {
          reported_device_id: reportedDevice.id,
          vendor_name: otherName.vendor,
          product_name: otherName.product,
        }
      });
    }
  } catch {
    return {
      ok: false,
      error: "An error occurred while submitting report"
    };
  }

  return {
    ok: true,
    data: "Report submitted successfully"
  };
}
