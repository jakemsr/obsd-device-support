"use client";

import { ChangeEvent, Suspense, use, useEffect, useState } from "react";
import { toast } from "sonner";
import { Prisma } from "@/app/generated/prisma/client";
import { AuthSessionPromise, FullReport, FullDeviceInfo, InitialActionState } from "@/lib/local-types";
import { report_status, source_type, support_type } from "@/app/generated/prisma/enums";
import { Button, LoadingSpinner } from "@/app/components/Button";
import { getMatchedDevices } from '@/app/reports/[id]/actions';
import {
  updateReportSource,
  updateReportStatus,
  updateReportedDevice,
  updateReportedIssues,
  updateReportedOtherDeviceNames
} from '@/app/reports/[id]/edit/actions';


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
      <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-2 max-w-fit">
        <div className="col-span-4">
          Source #{index + 1}
        </div>
        {source.name && (
          <>
            <div>
              Name:
            </div>
            <div className="col-span-3">
              <input type="text" name="sourceName" defaultValue={source.name} />
            </div>
          </>
        )}
        <>
          <div>
            Type:
          </div>
          <div className="col-span-3">
            <select name="sourceType" defaultValue={source.source_type}>
              {Object.values(source_type).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </>
        {source.url && (
          <>
            <div>
              URL:
            </div>
            <div className="col-span-3">
              <input type="text" name="sourceUrl" defaultValue={source.url} />
            </div>
          </>
        )}
        <input type="hidden" name="sourceId" value={String(source.id)} />
        <input type="hidden" name="reportId" value={String(source.report_id)} />
        <input type="hidden" name="userId" value={userId} />
        <div className="col-span-4">
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

const DeviceDisplay = ({ report, device, matchedDevices }: { report: FullReport, device: FullReportedDevice, matchedDevices?: FullDeviceInfo[] }) => {

  enum SubmitType {
    Device = "device",
    Issues = "issues",
    OtherNames = "otherNames"
  }

  const [loadingDevice, setLoadingDevice] = useState(false);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [loadingOtherNames, setLoadingOtherNames] = useState(false);

  interface valueField {
    value: string;
  }

  const [addedIssueFields, setAddedIssueFields] = useState<valueField[]>([]);
  const [addedOtherDeviceNameVendorFields, setAddedOtherDeviceNameVendorFields] = useState<valueField[]>([]);
  const [addedOtherDeviceNameProductFields, setAddedOtherDeviceNameProductFields] = useState<valueField[]>([]);

  const handleAddedIssueChange = (index: number, event: ChangeEvent<HTMLTextAreaElement>) => {
    const data = [...addedIssueFields];
    data[index].value = event.target.value;
    setAddedIssueFields(data);
  };

  const handleAddedOtherDeviceNameVendorChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const data = [...addedOtherDeviceNameVendorFields];
    data[index].value = event.target.value;
    setAddedOtherDeviceNameVendorFields(data);
  };

  const handleAddedOtherDeviceNameProductChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const data = [...addedOtherDeviceNameProductFields];
    data[index].value = event.target.value;
    setAddedOtherDeviceNameProductFields(data);
  };

  const addIssueField = () => {
    setAddedIssueFields([...addedIssueFields, { value: '' }]);
  };

  const addOtherDeviceNameField = () => {
    setAddedOtherDeviceNameVendorFields([...addedOtherDeviceNameVendorFields, { value: '' }]);
    setAddedOtherDeviceNameProductFields([...addedOtherDeviceNameProductFields, { value: '' }]);
  };


  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>, submitType: SubmitType) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let result;
    switch (submitType) {
      case SubmitType.Device:
        setLoadingDevice(true);
        result = await updateReportedDevice(InitialActionState, formData);
        setLoadingDevice(false);
        break;
      case SubmitType.Issues:
        setLoadingIssues(true);
        result = await updateReportedIssues(InitialActionState, formData);
        setLoadingIssues(false);
        break;
      case SubmitType.OtherNames:
        setLoadingOtherNames(true);
        result = await updateReportedOtherDeviceNames(InitialActionState, formData);
        setLoadingOtherNames(false);
        break;
    }
    if (result.success) {
      toast.success(result.message);
      if (submitType === SubmitType.Issues) {
        setAddedIssueFields([]);
      } else if (submitType === SubmitType.OtherNames) {
        setAddedOtherDeviceNameVendorFields([]);
        setAddedOtherDeviceNameProductFields([]);
      }
    } else {
      toast.error(result.error + ": " + result.message);
    }
  };


  return (
    <div className="my-2 grid grid-cols-1 sm:grid-cols-2 gap-y-6">
      <div>
        <form
          onSubmit={(e) => handleSubmit(e, SubmitType.Device)}
          className="grid grid-cols-4 gap-2"
        >
          <input type="hidden" name="reportId" value={String(device.report_id)} />
          <input type="hidden" name="userId" value={report.user_id} />
          <input type="hidden" name="deviceId" value={String(device.id)} />
          <div>
            Bus:
          </div>
          <div className="col-span-3">
            <input type="text" name="bus" defaultValue={device.bus} />
          </div>
          <div>
            Vendor ID:
          </div>
          <div className="col-span-3">
            <input type="text" name="vendorId" defaultValue={device.vendor_id} />
          </div>
          <div>
            Product ID:
          </div>
          <div className="col-span-3">
            <input type="text" name="productId" defaultValue={device.product_id} />
          </div>
          <div>
            Vendor:
          </div>
          <div className="col-span-3">
            <input type="text" name="vendorName" defaultValue={device.reported_vendor ?? ""} />
          </div>
          <div>
            Product:
          </div>
          <div className="col-span-3">
            <input type="text" name="productName" defaultValue={device.reported_product ?? ""} />
          </div>
          <div>
            Driver:
          </div>
          <div className="col-span-3">
            <input type="text" name="driverName" defaultValue={device.reported_driver ?? ""} />
          </div>
          <div>
            Support Status:
          </div>
          <div className="col-span-3">
            <select name="supportStatus" defaultValue={device.support_status}>
              {Object.values(support_type).map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-4">
            {device.reported_issues.map(issue => (
              <input key={issue.id} type="hidden" name="reportedIssues" value={String(issue.id)} />
            ))}
            {device.reported_other_device_names.map(name => (
              <input key={name.id} type="hidden" name="reportedOtherDeviceNames" value={String(name.id)} />
            ))}
            <Button type="submit" disabled={loadingDevice}>
              {loadingDevice && <LoadingSpinner />}
              Update Device
            </Button>
          </div>
        </form>

        <div className="mt-6">
          Reported Issues:
          {device.reported_issues.length === 0 ? (
            <div className="px-4">
              No reported issues
              <Button type="button" onClick={addIssueField}>
                Add Another Issue
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => handleSubmit(e, SubmitType.Issues)}
              className="px-4"
            >
              <input type="hidden" name="userId" value={String(report.user_id)} />
              <input type="hidden" name="deviceId" value={String(device.id)} />
              <input type="hidden" name="reportedIssueCount" value={String(device.reported_issues.length)} />
              {device.reported_issues.map((issue, index) => (
                <div key={index} className="grid grid-cols-4 gap-4">
                  <input type="hidden" name={`reportedIssueId${index}`} value={String(issue.id)} />
                  <div>
                    Issue #{index + 1}:
                  </div>
                  <textarea
                    className="px-4 col-span-3"
                    name={`reportedIssueText${index}`}
                    defaultValue={issue.description}
                    key={issue.id}
                  />
                </div>
              ))}
              <input type="hidden" name="addedIssueCount" value={String(addedIssueFields.length)} />
              {addedIssueFields.map((issue, index) => (
                <div key={index} className="grid grid-cols-4 gap-4">
                  <div>
                    Issue #{device.reported_issues.length + index + 1}:
                  </div>
                  <textarea
                    className="px-4 col-span-3"
                    name={`addedIssueText${index}`}
                    value={issue.value}
                    onChange={(e) => handleAddedIssueChange(index, e)}
                  />
                </div>
              ))}
              <div className="mt-2">
                <Button type="button" onClick={addIssueField}>
                  Add Another Issue
                </Button>
              </div>
              <div className="mt-2">
                <Button type="submit" disabled={loadingIssues}>
                  {loadingIssues && <LoadingSpinner />}
                  Update Reported Issues
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6">
          Other device names:
          {device.reported_other_device_names.length === 0 ? (
            <div className="px-4">
              No reported other device names
              <Button type="button" onClick={addOtherDeviceNameField}>
                Add Another Other Device Name
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => handleSubmit(e, SubmitType.OtherNames)}
              className="px-4"
            >
              <input type="hidden" name="userId" value={String(report.user_id)} />
              <input type="hidden" name="deviceId" value={String(device.id)} />
              <input type="hidden" name="reportedOtherDeviceNameCount" value={String(device.reported_other_device_names.length)} />
              {device.reported_other_device_names.map((name, index) => (
                <div key={index} className="grid grid-cols-4">
                  <input type="hidden" name={`reportedOtherDeviceNameId${index}`} value={String(name.id)} />
                  <div className="col-span-4 mt-2">
                    Other Device Name #{index + 1}:
                  </div>
                  <div>
                    Vendor
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      name={`reportedOtherDeviceNameVendorText${index}`}
                      defaultValue={name.vendor_name}
                      key={`${name.id}-${name.vendor_name}`}
                    />
                  </div>
                  <div>
                    Product
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      name={`reportedOtherDeviceNameProductText${index}`}
                      defaultValue={name.product_name}
                      key={`${name.id}-${name.product_name}`}
                    />
                  </div>
                </div>
              ))}
              <input type="hidden" name="addedOtherDeviceNameCount" value={String(addedOtherDeviceNameVendorFields.length)} />
              {addedOtherDeviceNameVendorFields.map((issue, index) => (
                <div key={index} className="grid grid-cols-4">
                  <div className="col-span-4">
                    Other Device Name #{device.reported_other_device_names.length + index + 1}:
                  </div>
                  <div>
                    Vendor
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      name={`addedOtherDeviceNameVendor${index}`}
                      value={addedOtherDeviceNameVendorFields[index].value}
                      onChange={(e) => handleAddedOtherDeviceNameVendorChange(index, e)}
                    />
                  </div>
                  <div>
                    Product
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      name={`addedOtherDeviceNameProduct${index}`}
                      value={addedOtherDeviceNameProductFields[index].value}
                      onChange={(e) => handleAddedOtherDeviceNameProductChange(index, e)}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-2">
                <Button type="button" onClick={addOtherDeviceNameField}>
                  Add Another Other Device Name
                </Button>
              </div>
              <div className="mt-2">
                <Button type="submit" disabled={loadingOtherNames}>
                  {loadingOtherNames && <LoadingSpinner />}
                  Update Reported Other Device Names
                </Button>
              </div>
            </form>
          )}
        </div>
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
                <DeviceDisplay report={report} device={device} matchedDevices={matchMap.get(device.id)} />
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

  const filteredStatusOptions = statusOptions.filter(
    (option) =>
      option.value === report_status.pending ||
      option.value === report_status.withdrawn
  );

  const [showWithdrawnMessage, setShowWithdrawnMessage] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const result = await updateReportStatus(InitialActionState, formData);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error + ": " + result.message);
    }
    setLoading(false);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === report_status.withdrawn) {
      setShowWithdrawnMessage(true);
    } else {
      setShowWithdrawnMessage(false);
    }
  };


  return (
    <>
      <form onSubmit={handleSubmit}>
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
        <Button type="submit" disabled={loading}>
          {loading && <LoadingSpinner />}
          Update Status
        </Button>
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