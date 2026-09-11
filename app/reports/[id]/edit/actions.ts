'use server'

import { refresh } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth'
import type { report_status } from '@/app/generated/prisma/enums'
import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import type { ActionState } from '@/lib/local-types'


async function checkAuth(userId: string): Promise<boolean> {

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || !session.user ||
    !(session.user.role === "editor" || session.user.id === userId)) {
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
