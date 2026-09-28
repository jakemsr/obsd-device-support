'use client'

import { FullDeviceInfo } from "@/lib/local-types";
import { support_type } from "@/app/generated/prisma/enums";
import { getDriverList, updateDevice, type DriverListEntry } from "@/app/device/edit/[id]/actions";
import { use, useEffect, useState } from "react";
import { Button } from "@/app/components/Button";
import { toast } from "sonner";


interface EditDeviceProps {
  devicePromise: Promise<FullDeviceInfo | null>;
}

const EditDevice = ({ devicePromise }: EditDeviceProps) => {

  const device = use(devicePromise);

  if (!device) {
    return (
      <div className="px-4">
        Device not found
      </div>
    );
  }

  const [driverList, setDriverList] = useState<DriverListEntry[]>([]);

  type Issue = {
    index: number;
    id: string;
    description: string;
  }
  const [issues, setIssues] = useState<Issue[]>(
    device.issues.map((issue, index) => (
      { index, id: String(issue.id), description: issue.description }
    ))
  );

  type OtherDeviceName = {
    id: bigint;
    vendor_name: string;
    device_name: string;
  }
  const [otherDeviceNames, setOtherDeviceNames] = useState<OtherDeviceName[]>(
    device.other_device_names.map(name => (
      { id: name.id, vendor_name: name.vendor_name, device_name: name.device_name }
    ))
  );

  useEffect(() => {
    getDriverList().then(setDriverList);
  }, []);

  const addIssue = () => {
    setIssues([...issues, { index: issues.length, id: "", description: "" }]);
  }

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await updateDevice(formData);
    if (result.success) {
      toast.success(result.message);
      setIssues(device.issues.map((issue, index) => (
        { index, id: String(issue.id), description: issue.description }
      )));
    } else {
      toast.error(result.error + " " + result.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-3 gap-2 w-fit"
    >
      <input type="hidden" name="device_id" value={String(device.id)} />
      <div className="font-bold">
        Bus:
      </div>
      <div className="col-span-2">
        {device.bus}
      </div>

      <div className="font-bold">
        VID / PID:
      </div>
      <div className="col-span-2">
        {device.bus === "USB" ? device.vendors.usb_id : device.vendors.pci_id} / {device.product_id}
      </div>

      <div className="font-bold">
        Name:
      </div>
      <div className="col-span-2">
        {device.vendors.name} {device.name}
      </div>

      <div>
        <label htmlFor="support_status">Support Status:</label>
      </div>
      <div className="col-span-2">
        <select name="support_status" id="support_status" defaultValue={device.support_status}>
          {Object.values(support_type).map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="driver_id">Driver:</label>
      </div>
      <div className="col-span-2">
        <select name="driver_id" id="driver_id" defaultValue={String(device.drivers.id)}>
          {driverList.map(driver => (
            <option key={driver.id} value={String(driver.id)}>
              {driver.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="issues">Issues:</label>
        <input type="hidden" name="issues_count" value={String(issues.length)} />
      </div>
      <div className="col-span-2">
        {issues.map(issue => (
          <div key={issue.index}>
            {issue.index} {issue.id}
            <input type="hidden" name={`issue_id_${issue.index}`} value={issue.id} />
            <textarea
              name={`issue_text_${issue.index}`}
              defaultValue={issue.description}
              className="h-20 w-100"
            />
          </div>))}
        <Button type="button" onClick={addIssue}>
          Add Issue
        </Button>
      </div>
      <div>
        <label htmlFor="other_device_names">Other Device Names:</label>
      </div>
      <div className="col-span-2">
        {otherDeviceNames.map(name =>
          <div key={name.id}>
            {name.vendor_name} {name.device_name}
          </div>)}
      </div>
      <Button type="submit">
        Save
      </Button>
    </form>
  );
}

export default EditDevice;
