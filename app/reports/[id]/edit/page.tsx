import prisma from "@/lib/prisma";
import Link from "next/link";
import EditReport from "@/app/components/reports/EditReport";
import { Suspense } from "react";
import { AuthSession, FullReport } from "@/lib/local-types";
import { getSessionPromise } from "@/lib/check-user-auth";


export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;

  const reportPromise: Promise<FullReport | null> = prisma.reports.findUnique({
    where: {
      id: BigInt(id),
    },
    include: {
      sources: {
        where: { report_element_status: 'current' },
        include: {
          hwinspect_report: true,
          form_report: true,
        },
      },
      reported_devices: {
        where: { report_element_status: 'current' },
        include: {
          reported_issues: {
            where: { report_element_status: 'current' },
          },
          reported_other_device_names: {
            where: { report_element_status: 'current' },
          },
        }
      }
    }
  });

  const sessionPromise: Promise<AuthSession | null> = getSessionPromise();

  return (
    <div className="px-4 mt-4">
      <Link
        href="/reports"
        className="text-link hover:underline"
      >
        &larr; Back to reports
      </Link>
      <h1 className="mt-4">Edit Report {id}</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <EditReport reportPromise={reportPromise} sessionPromise={sessionPromise} />
      </Suspense>
    </div>
  );
}
