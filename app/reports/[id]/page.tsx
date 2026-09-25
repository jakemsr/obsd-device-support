import { Suspense } from "react";
import Link from "next/link";
import ReportDisplay from "@/app/components/reports/ReportDisplay";


export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params;

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
        <ReportDisplay id={id} />
      </Suspense>
    </div>
  );
}
