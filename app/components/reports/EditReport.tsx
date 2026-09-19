"use client";

import { Suspense, use, useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Prisma } from "@/app/generated/prisma/client";
import { AuthSessionPromise, FullReport, FullDeviceInfo, InitialActionState, ActionState } from "@/lib/local-types";
import { report_status, source_type } from "@/app/generated/prisma/enums";
import { Button, LoadingSpinner } from "@/app/components/Button";
import { getMatchedDevices } from '@/app/reports/[id]/actions';
import { updateReportSource, updateReportStatus } from '@/app/reports/[id]/edit/actions';


type SourceWithReports = Prisma.report_sourcesGetPayload<{
  include: {
    hwinspect_report: true;
    form_report: true;
  };
}>;

interface SourceDisplayProps {
  index: number;
  source: SourceWithReports;
  userId: string;
}

const SourceDisplay = ({ index, source, userId }: SourceDisplayProps) => {

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const result = await updateReportSource(InitialActionState, formData);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error + ": " + result.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          Source #{index + 1}
        </div>
        {source.name && (
          <div className="mt-2">
            <label>
              Name: <input type="text" name="sourceName" defaultValue={source.name} />
            </label>
          </div>
        )}
        <div className="mt-2">
          <label>
            Type: <select name="sourceType" defaultValue={source.source_type}>
              {Object.values(source_type).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
        </div>
        {source.url && (
          <div className="mt-2">
            <label>
              URL: <input type="text" name="sourceUrl" defaultValue={source.url} />
            </label>
          </div>
        )}
        <input type="hidden" name="sourceId" value={String(source.id)} />
        <input type="hidden" name="reportId" value={String(source.report_id)} />
        <input type="hidden" name="userId" value={userId} />
        <div className="mt-2">
          <Button type="submit">
            {loading && <LoadingSpinner />}
            Update Source #{index + 1}
          </Button>
        </div>
      </form>
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

  if (!session || !session.user || session.user.id !== report.user_id) {
    return <div>Not authorized to edit this report</div>;
  }

  if (report.status === "withdrawn") {
    return <div>Cannot edit a withdrawn report</div>;
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

  const [showWithdrawnMessage, setShowWithdrawnMessage] = useState(false);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === report_status.withdrawn) {
      setShowWithdrawnMessage(true);
    } else {
      setShowWithdrawnMessage(false);
    }
  };


  return (
    <>
      <form action={statusFormAction}>
        <div className="px-4 my-4">
          <div>
            Status: {report.status.split("_").join(" ")}
            &nbsp;
            <select
              name="newStatus"
              defaultValue={report.status}
              onChange={(e) => { handleStatusChange(e) }}
            >
              {filteredStatusOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input type="hidden" name="reportId" value={report.id.toString()} />
            <input type="hidden" name="userId" value={report.user_id} />
            {showWithdrawnMessage && (
              <div className="my-2 w-100 h-20">
                <textarea
                  name="withdrawnNote"
                  placeholder="Provide a reason for withdrawing the report"
                  className="w-full h-full p-2"
                />
              </div>
            )}
          </div>
          <div>
            Created At: {report.created_at.toLocaleString()}
          </div>
          <div>
            Updated At: {report.updated_at.toLocaleString()}
          </div>
          {report.withdrawn_at && (
            <div>
              Withdrawn At: {report.withdrawn_at.toLocaleString()}
            </div>
          )}
          {report.withdrawn_note && (
            <div>
              Withdrawn Note: {report.withdrawn_note}
            </div>
          )}
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
                <SourceDisplay index={index} source={source} userId={report.user_id} />
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