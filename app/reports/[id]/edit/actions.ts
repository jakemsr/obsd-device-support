'use server'

import { refresh } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth'
import { report_status, source_type, report_element_status } from '@/app/generated/prisma/enums'
import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import type { ActionState } from '@/lib/local-types'


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
