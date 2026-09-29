import ReportDisplay from "@/app/components/reports/ReportDisplay";
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { getSessionPromise } from "@/lib/check-user-auth";
import { AuthSession, ReportReview } from "@/lib/local-types";
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

  const sessionPromise: Promise<AuthSession | null> = getSessionPromise();

  const reviewsPromise: Promise<ReportReview[]> = prisma.report_reviews.findMany({
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
          editingReviewId={review.completed_at === null ? review.id : undefined}
        />
      </Suspense>

      {review.completed_at === null && <EditReview review={review} />}
    </>
  );

}