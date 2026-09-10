import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { ReportWithRelations } from "@/lib/local-types";
import ListReports from "@/app/components/reports/ListReports";


export default async function Page() {

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || !session.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh">
        <h1>
          Reports
        </h1>
        <p>
          You must be logged in to view this page.
        </p>
      </div>
    );
  }

  const user = session.user;

  const reportsPromise: Promise<ReportWithRelations[]> = prisma.reports.findMany({
    where: {
      user_id: user.id
    },
    include: {
      sources: {
        where: {
          status: "current",
        },
      },
      reported_devices: true
    }
  });

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Your Reports
      </h1>
      <Suspense fallback={<div>Loading reports...</div>}>
        <ListReports reportsPromise={reportsPromise}/>
      </Suspense>
    </div>
  )
}