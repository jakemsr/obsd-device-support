import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import prisma from "@/lib/prisma";


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

  const reports = await prisma.reports.findMany({
    where: {
      user_id: user.id
    },
    include: {
      sources: true,
      reported_devices: true
    }
  });
  return (
    <div className="m-4">
      <h1>
        Reports
      </h1>
      <p>
        This is the reports page.
      </p>
      <div>
        {reports.map(report => (
          <Link key={report.id} href={`/reports/${report.id}`}>
            <div>
              ID: {report.id} 
            </div>
            <div>
              Status: {report.status}
            </div>
            <div>
              Created At: {report.created_at.toLocaleString()}
            </div>
            <div>
              Updated At: {report.updated_at.toLocaleString()}
            </div>
            <div>
              Sources: {report.sources.map(source => source.name).join(", ")}
            </div>
            <div>
              Reported Devices: {report.reported_devices.map(device => `${device.vendor_id}:${device.product_id}`).join(", ")}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}