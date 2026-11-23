"use server"

import { refresh } from "next/cache";
import { ActionResult } from "@/lib/local-types";
import { getUserId } from "@/lib/check-user-auth";
import prisma from "@/lib/prisma";


export async function submitReview(formData: FormData): Promise<ActionResult<string>> {
  const reportId = formData.get('reportId') as string;
  const userId = formData.get('userId') as string;
  const note = formData.get('note') as string;

  if (!userId || userId !== await getUserId()) {
    return {
      ok: false,
      error: "Access denied"
    };
  }

  if (!reportId) {
    return {
      ok: false,
      error: "Report ID is missing"
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
  } catch {
    return {
      ok: false,
      error: "An error occurred while saving the review"
    };
  }

  refresh();
  
  return {
    ok: true,
    data: "Review successfully saved"
  };
}
