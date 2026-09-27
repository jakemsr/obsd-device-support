import { Suspense } from "react";
import { cookies } from "next/headers";
import { setShowAllReports } from "./actions";
import prisma from "@/lib/prisma";
import type { ReportWithRelations } from "@/lib/local-types";
import { Button } from "@/app/components/Button";
import ListReports from "@/app/components/reports/ListReports";
import { getCurrentUser } from "@/lib/check-user-auth";
import type { AuthUser } from "@/lib/local-types";


export default async function Page() {

  const currentUser: AuthUser | null = await getCurrentUser();

  if (!currentUser) {
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

  const cookieStore = await cookies();

  const showAllReports =
    currentUser.role === "editor" &&
    cookieStore.get("reports_view")?.value === "all";

  const reportsPromise: Promise<ReportWithRelations[]> = prisma.reports.findMany({
    where: showAllReports ? undefined : {
      user_id: currentUser.id
    },
    include: {
      sources: {
        where: {
          report_element_status: "current",
        },
      },
      reported_devices: {
        where: {
          report_element_status: "current",
        }
      },
      user: true,
    },
    orderBy: [
      {
        created_at: 'asc',
      },
      {
        id: 'asc',
      }
    ]
  });

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-2xl font-bold text-center">
          {showAllReports ? "All Reports" : "Your Reports"}
        </h1>

        {currentUser.role === "editor" && (
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
