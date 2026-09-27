import { Suspense } from "react";
import prisma from "@/lib/prisma";
import ListReviews from "@/app/components/report-reviews/ListReviews";
import type { ReportReview } from "@/lib/local-types";


export default function Page() {

  const reviewsPromise: Promise<ReportReview[]> = prisma.report_reviews.findMany({
    include: {
      report: true,
      reviewer: true,
    }
  });

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">
        Report Reviews
      </h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ListReviews reviewsPromise={reviewsPromise} />
      </Suspense>
    </div>
  )
}
