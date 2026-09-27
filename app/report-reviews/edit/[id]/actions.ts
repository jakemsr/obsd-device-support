'use server'

import { ActionState } from "@/lib/local-types";
import prisma from "@/lib/prisma";
import { refresh } from "next/cache";


export async function updateReview(
  prevState: ActionState, formData: FormData
): Promise<ActionState> {
  const reviewId = BigInt(formData.get("reviewId") as string);
  const notes = formData.get("notes") as string | null;
  const completed = formData.get("completed") === "on";

  try {
    await prisma.report_reviews.update({
      where: { id: reviewId },
      data: {
        notes,
        completed_at: completed ? new Date() : null,
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
