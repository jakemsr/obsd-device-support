'use server'

import { ActionState } from "@/lib/local-types";
import prisma from "@/lib/prisma";
import { report_status } from "@/app/generated/prisma/enums";
import { refresh } from "next/cache";
import { getCurrentUser } from "@/lib/check-user-auth";


export async function updateReview(formData: FormData): Promise<ActionState> {
  const reviewId = formData.get("reviewId") as string;
  const notes = formData.get("notes") as string;
  const completed = formData.get("completed") === "on";
  const reportStatus = formData.get("reportStatus") as string;

  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "editor") {
    return {
      success: false,
      error: "Unauthorized",
      message: "You must be an editor to perform this action"
    };
  }

  if (!reviewId) {
    return {
      success: false,
      error: "Invalid input",
      message: "Review ID is required"
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
      success: false,
      error: "Invalid input",
      message: "The provided report status is not valid"
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
      success: false,
      error: "Review update failed",
      message: (error as Error).message
    };
  }

  refresh();

  return {
    success: true,
    error: "",
    message: "Successfully updated review"
  };
}
