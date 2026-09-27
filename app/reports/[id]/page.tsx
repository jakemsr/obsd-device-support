import { Suspense } from "react";
import Link from "next/link";
import ReportDisplay from "@/app/components/reports/ReportDisplay";
import ShowReviews from "@/app/components/reports/ShowReviews";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { ReportReview } from "@/lib/local-types";


export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params;
  const reportId = BigInt(id);

  const reviewsPromise: Promise<ReportReview[]> = prisma.report_reviews.findMany({
    where: {
      report_id: reportId,
    },
    include: {
      reviewer: true,
      report: true,
    },
  });

  const sessionPromise = auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="px-4">
      <div className="mb-4">
        <Link
          href="/reports"
          className="text-link hover:underline"
        >
          &larr; Back to reports
        </Link>
      </div>
      <div>
        Report ID {id}
      </div>

      <Suspense fallback={<div className="px-4 mt-2">Loading report...</div>}>
        <ReportDisplay id={id} sessionPromise={sessionPromise} />
      </Suspense>

      <Suspense fallback={<div className="px-4 mt-2">Loading reviews...</div>}>
        <ShowReviews
          reviewsPromise={reviewsPromise}
          sessionPromise={sessionPromise}
          reportId={reportId}
        />
      </Suspense>

    </div>
  );
}
