"use server"

import { refresh } from "next/cache";
import { ActionState } from "@/lib/local-types";
import { checkUserAuth } from "@/lib/check-user-auth";
import prisma from "@/lib/prisma";


export async function submitReview(
  prevState: ActionState, formData: FormData
): Promise<ActionState> {
  const reportId = formData.get('reportId') as string;
  const userId = formData.get('userId') as string;
  const note = formData.get('note') as string;

  if (!userId || !await checkUserAuth(userId)) {
    return {
      error: 'Unauthorized',
      success: false,
      message: 'Not logged in or not the correct user'
    };
  }

  if (!reportId) {
    return {
      error: 'Invalid input',
      success: false,
      message: 'Report ID is missing'
    };
  }

  try {
    await prisma.report_reviews.create({
      data: {
        report_id: BigInt(reportId),
        reviewer_id: userId,
        notes: note
      }
    });
  } catch (err) {
    return {
      error: 'Error',
      success: false,
      message: 'An error occurred while saving the review'
    };
  }

  refresh();
  
  return {
    error: "",
    success: true,
    message: 'Review successfully saved'
  };
}
