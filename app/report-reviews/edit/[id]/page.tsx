import ReportDisplay from "@/app/components/reports/ReportDisplay";
import { Suspense } from "react";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ReportReview } from "@/lib/local-types";
import EditReview from "@/app/components/report-reviews/EditReview";
import ShowReviews from "@/app/components/reports/ShowReviews";


export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params;

  const review: ReportReview | null = await prisma.report_reviews.findUnique({
    where: { id: BigInt(id) },
    include: {
      report: true,
      reviewer: true,
    }
  });

  if (!review) {
    return <div>Report Review not found</div>;
  }

  if (review.completed_at !== null) {
    return <div>Cannot edit a completed review</div>;
  }

  const sessionPromise = auth.api.getSession({
    headers: await headers(),
  });

  const reviewsPromise = prisma.report_reviews.findMany({
    where: { report_id: BigInt(review.report_id) },
    include: {
      report: true,
      reviewer: true,
    },
  });

  return (
    <>
      <div>Edit Report Review ID: {id}</div>
      <Suspense fallback={<div>Loading Report...</div>}>
        <ReportDisplay id={String(review.report_id)} sessionPromise={sessionPromise} />
      </Suspense>

      <Suspense fallback={<div className="px-4 mt-2">Loading reviews...</div>}>
        <ShowReviews
          reviewsPromise={reviewsPromise}
          sessionPromise={sessionPromise}
          reportId={review.report_id}
          editingReviewId={review.id}
        />
      </Suspense>

      <EditReview review={review} />
    </>
  );

}