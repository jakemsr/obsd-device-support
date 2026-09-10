import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import EditReport from "@/app/components/reports/EditReport"; 
import { Suspense } from "react";
import { AuthSessionPromise, FullReport } from "@/lib/local-types";
import { auth } from "@/lib/auth";


export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;

  const reportPromise: Promise<FullReport | null> = prisma.reports.findUnique({
    where: {
      id: BigInt(id),
    },
    include: {
      sources: {
        include: {
          hwinspect_report: true,
          form_report: true,
        },
      },
      reported_devices: {
        include: {
          reported_issues: true,
          reported_other_device_names: true,
        }
      }
    }
  });

  const sessionPromise: AuthSessionPromise = auth.api.getSession({
    headers: await headers(),
  });


  return (
    <div className="px-4 mt-4">
      <h1>Edit Report {id}</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <EditReport reportPromise={reportPromise} sessionPromise={sessionPromise} />
      </Suspense>
    </div>
  );
}
