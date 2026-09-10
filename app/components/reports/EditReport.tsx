"use client";

import { Suspense, use, useActionState, useEffect, useState } from "react";
import { Prisma } from "@/app/generated/prisma/client";
import { AuthSessionPromise, FullReport, FullDeviceInfo, InitialActionState } from "@/lib/local-types";
import { report_status } from "@/app/generated/prisma/enums";
import { Button, LoadingSpinner } from "@/app/components/Button";
import { updateReportStatus, getMatchedDevices } from '@/app/reports/[id]/edit/actions';


type SourceWithReports = Prisma.report_sourcesGetPayload<{
  include: {
    hwinspect_report: true;
    form_report: true;
  };
}>;

const SourceDisplay = ({ index, source }: { index: number, source: SourceWithReports }) => {
  return (
    <div>
      <div>
        Source #{index + 1}
      </div>
      {source.name && (
        <div>
          Name: {source.name}
        </div>
      )}
      <div>
        Type: {source.source_type}
      </div>
      {source.url && (
        <div>
          URL: {source.url}
        </div>
      )}
      {source.hwinspect_report && (
        <div>
          hwinspect Report:
          <div>
            ID: {source.hwinspect_report.id}
          </div>
          <div>
            hwinspect Version: {source.hwinspect_report.hwinspect_version}
          </div>
          <div>
            OpenBSD Version: {source.hwinspect_report.openbsd_version}
          </div>
          <div>
            Architecture: {source.hwinspect_report.architecture}
          </div>
          <div>
            Collected At: {source.hwinspect_report.collected_at?.toLocaleString()}
          </div>
          <div>
            Payload: {JSON.stringify(source.hwinspect_report.payload, null, 2)}
          </div>
          <div>
            Payload Version: {source.hwinspect_report.payload_version}
          </div>
        </div>
      )}
      {source.form_report && (
        <div>
          Form Report:
          <div>
            ID: {source.form_report.id}
          </div>
          <div>
            Report Source ID: {source.form_report.report_source_id}
          </div>
          <div>
            URL: {source.form_report.url}
          </div>
          <div>
            Collected At: {source.form_report.collected_at?.toLocaleString()}
          </div>
          <div>
            Payload: {JSON.stringify(source.form_report.payload, null, 2)}
          </div>
          <div>
            Payload Version: {source.form_report.payload_version}
          </div>
        </div>
      )}
    </div>
  );
}


type FullReportedDevice = Prisma.reported_devicesGetPayload<{
  include: {
    reported_issues: true;
    reported_other_device_names: true;
  };
}>;

const DeviceDisplay = ({ device, matchedDevices }: { device: FullReportedDevice, matchedDevices?: FullDeviceInfo[] }) => {
  return (
    <div className="my-2 grid grid-cols-1 sm:grid-cols-2 gap-y-6">
      <div>
        <div>
          Bus: {device.bus}
        </div>
        <div>
          Vendor ID: {device.vendor_id}
        </div>
        <div>
          Product ID: {device.product_id}
        </div>
        <div>
          Reported Vendor: {device.reported_vendor}
        </div>
        <div>
          Reported Product: {device.reported_product}
        </div>
        <div>
          Reported Driver: {device.reported_driver}
        </div>
        <div>
          Support Status: {device.support_status}
        </div>

        {device.reported_issues.length > 0 && (
          <div>
            Reported Issues: {device.reported_issues.map(issue => (
              <div
                className="px-4 mt-2"
                key={issue.id}
              >
                {issue.description}
              </div>
            ))}
          </div>
        )}

        {device.reported_other_device_names.length > 0 && (
          <div className="mt-2">
            Reported Other Device Names: {device.reported_other_device_names.map(name => (
              <div
                className="px-4"
                key={name.id}
              >
                {name.vendor_name} {name.product_name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        {matchedDevices && matchedDevices.length > 0 ? (
          <>
            VID/PID Matches Existing Devices:
            {matchedDevices.map(matchedDevice => (
              <div key={matchedDevice.id} className="px-4 mt-2">
                <div>
                  Vendor: {matchedDevice.vendors.name}
                </div>
                <div>
                  Product: {matchedDevice.name}
                </div>
                <div>
                  Driver: {matchedDevice.drivers.name}
                </div>

                {matchedDevice.issues.length > 0 ? (
                  <div>
                    Issues: {matchedDevice.issues.map(issue => (
                      <div className="px-4" key={issue.id}>
                        {issue.description}
                      </div>
                    ))}
                  </div>
                ) : <div>No known issues</div>}

                {matchedDevice.other_device_names.length > 0 ? (
                  <div>
                    Other Device Names: {matchedDevice.other_device_names.map(name => (
                      <div className="px-4" key={name.id}>
                        {name.vendor_name} {name.device_name}
                      </div>
                    ))}
                  </div>
                ) : <div>No other device names</div>}

              </div>
            ))}
          </>
        ) : "No matching devices"}
      </div>
    </div>
  );
}

const ShowDevices = ({ report }: { report: FullReport }) => {

  const [matchMap, setMatchMap] = useState<Map<bigint, FullDeviceInfo[]>>(new Map());

  useEffect(() => {
    const fetchMatchedDevices = async () => {
      const matchMap = await getMatchedDevices(report);
      setMatchMap(matchMap);
    };
    fetchMatchedDevices();
  }, [report]);

  return (
    <>
      {
        report.reported_devices.length > 0 && (
          <div className="mt-4">
            Reported Devices:
            {report.reported_devices.map(device => (
              <div
                className="px-4 border-t"
                key={device.id}
              >
                <DeviceDisplay device={device} matchedDevices={matchMap.get(device.id)} />
              </div>
            ))}
          </div>
        )
      }
    </>
  );
}


interface EditReportProps {
  reportPromise: Promise<FullReport | null>;
  sessionPromise: AuthSessionPromise;
}

export default function EditReport({ reportPromise, sessionPromise }: EditReportProps) {
  const report = use(reportPromise);
  const session = use(sessionPromise);

  if (!report) {
    return <div>Report not found</div>;
  }

  if (!session || !session.user ||
    !(session.user.role === "editor" || session.user.id === report.user_id)) {
    return <div>User not authenticated</div>;
  }


  const statusOptions = Object.values(report_status).map((value) => ({
    value,
    label: value.replace(/_/g, " "),
  }));

  const filteredStatusOptions =
    session.user.role !== "editor"
      ? statusOptions.filter(
        (option) =>
          option.value === report_status.pending ||
          option.value === report_status.withdrawn
      )
      : statusOptions;

  const [state, statusFormAction, pending] = useActionState(updateReportStatus, {
    ...InitialActionState
  });


  return (
    <>
      <form action={statusFormAction}>
        <div className="px-4 my-4">
          <div>
            Status: {report.status}
            &nbsp;
            <select name="newStatus" defaultValue={report.status}>
              {filteredStatusOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input type="hidden" name="reportId" value={report.id.toString()} />
            <input type="hidden" name="userId" value={report.user_id} />
          </div>
          <div>
            Created At: {report.created_at.toLocaleString()}
          </div>
          <div>
            Updated At: {report.updated_at.toLocaleString()}
          </div>
        </div>
        <Button type="submit" disabled={pending}>
          {pending && <LoadingSpinner />}
          Update Status
        </Button>
        {state.error &&
          <div className="my-2 text-error">
            {state.error} {state.message}
          </div>
        }
        {state.success &&
          <div className="my-2 text-success">
            {state.message}
          </div>
        }
      </form>
        <>
          {report.sources.length > 0 && (
            <div className="mt-4">
              Sources:
              {report.sources.map((source, index) => (
                <div
                  className="px-4 border-t"
                  key={source.id}
                >
                  <SourceDisplay index={index} source={source} />
                </div>
              ))}
            </div>
          )}
        </>
        <Suspense fallback={<div className="px-4 mt-2">Loading devices...</div>}>
          <ShowDevices report={report} />
        </Suspense>
    </>
  );
}