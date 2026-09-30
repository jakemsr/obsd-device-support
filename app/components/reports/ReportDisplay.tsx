import Link from "next/link";
import { report_status } from "@/app/generated/prisma/enums";
import { LinkButton } from "@/app/components/Button";
import { Suspense } from "react";
import { getFullReport } from "@/app/reports/[id]/actions";
import SourceDisplay from "@/app/components/reports/SourceDisplay";
import ShowDevices from "@/app/components/reports/ShowDevices";


interface ReportDisplayProps {
  id: string;
  sessionPromise: Promise<any>;
}

const ReportDisplay = async ({ id, sessionPromise }: ReportDisplayProps) => {

  const report = await getFullReport(id);

  if (!report) {
    return (
      <div>
        Report {id} not found!
      </div>
    );
  }

  const session = await sessionPromise;

  if (!session || !session.user ||
    !(session.user.id === report.user_id || session.user.role === "editor")) {
    return (
      <div>
        You must be logged in to view this report, or you do not have permission to view it.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid grid-cols-3">
          <div className="font-bold">
            Status:
          </div>
          <div className="col-span-2">
           {report.status.split("_").join(" ")}
          </div>
          <div className="font-bold">
            Created At:
          </div>
          <div className="col-span-2">
            {report.created_at.toLocaleString()}
          </div>
          <div className="font-bold">
            Updated At:
          </div>
          <div className="col-span-2">
            {report.updated_at.toLocaleString()}
          </div>
          <div className="font-bold">
            Reason:
          </div>
          <div className="col-span-2">
            {report.reason}
          </div>
          {report.withdrawn_at && (
            <>
              <div className="font-bold">
                Withdrawn At:
              </div>
              <div className="col-span-2">
                {report.withdrawn_at.toLocaleString()}
              </div>
            </>
          )}
          {report.withdrawn_note && (
            <>
              <div className="font-bold">
                Withdrawn Note:
              </div>
              <div className="col-span-2">
                {report.withdrawn_note}
              </div>
            </>
          )}
        </div>
        {session.user.id === report.user_id && report.status === report_status.pending && (
          <div className="w-fit">
            <Link href={`/reports/${id}/edit`}>
              <LinkButton>
                Edit Report
              </LinkButton>
            </Link>
          </div>
        )}
      </div>

      {report.sources.length > 0 && (
        <div className="mt-4">
          <div className="font-bold">
            Sources:
          </div>
          {report.sources.map((source, index) => (
            <div
              className="px-4"
              key={source.id}
            >
              <SourceDisplay index={index} source={source} />
            </div>
          ))}
        </div>
      )}

      <Suspense fallback={<div className="px-4 mt-2">Loading devices...</div>}>
        <ShowDevices report={report} />
      </Suspense>

    </div>
  )
}

export default ReportDisplay;
