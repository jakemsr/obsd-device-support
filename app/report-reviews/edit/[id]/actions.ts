'use server'

import { ActionResult } from "@/lib/local-types";
import prisma from "@/lib/prisma";
import { report_status } from "@/app/generated/prisma/enums";
import { refresh } from "next/cache";
import { getCurrentUser } from "@/lib/check-user-auth";


export async function updateReview(formData: FormData): Promise<ActionResult<string>> {
  const reviewId = formData.get("reviewId") as string;
  const notes = formData.get("notes") as string;
  const completed = formData.get("completed") === "on";
  const reportStatus = formData.get("reportStatus") as string;

  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "editor") {
    return {
      ok: false,
      error: "Access denied"
    };
  }

  if (!reviewId) {
    return {
      ok: false,
      error: "Review ID is required"
    };
  }

  let validReportStatus = undefined;
  for (const status of Object.values(report_status)) {
    if (status === reportStatus) {
      validReportStatus = status;
      break;
    }
  }

  if (!validReportStatus) {
    return {
      ok: false,
      error: "Invalid report status"
    };
  }


  try {
    await prisma.report_reviews.update({
      where: { id: BigInt(reviewId) },
      data: {
        notes,
        completed_at: completed ? new Date() : null,
        report: {
          update: {
            status: validReportStatus
          }
        }
      },
    });
  } catch (error) {
    return {
      ok: false,
      error: (error as Error).message
    };
  }

  refresh();

  return {
    ok: true,
    data: "Successfully updated review"
  };
}
