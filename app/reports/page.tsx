import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import { setShowAllReports } from "./actions";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { ReportWithRelations } from "@/lib/local-types";
import { Button } from "@/app/components/Button";
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

  const cookieStore = await cookies();

  const showAllReports =
    user.role === "editor" &&
    cookieStore.get("reports_view")?.value === "all";

  const reportsPromise: Promise<ReportWithRelations[]> = prisma.reports.findMany({
    where: showAllReports ? undefined : {
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
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-2xl font-bold text-center">
          {showAllReports ? "All Reports" : "Your Reports"}
        </h1>

        {user.role === "editor" && (
          <form action={setShowAllReports}>
            <input
              type="hidden"
              name="reportsView"
              value={showAllReports ? "user" : "all"}
            />

            <Button type="submit">
              {showAllReports ? "View my reports" : "View all reports"}
            </Button>
          </form>
        )}
      </div>

      <Suspense fallback={<div>Loading reports...</div>}>
        <ListReports reportsPromise={reportsPromise} />
      </Suspense>
    </div>
  )
}
