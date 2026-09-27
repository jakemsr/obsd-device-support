'use client'

import { FullDeviceInfo } from "@/lib/local-types";
import { support_type } from "@/app/generated/prisma/enums";
import { getDriverList, type DriverListEntry } from "@/app/device/edit/[id]/actions";
import { useEffect, useState } from "react";
  
interface EditDeviceProps {
  device: FullDeviceInfo;
}

const EditDevice = ({ device }: EditDeviceProps) => {

  const [driverList, setDriverList] = useState<DriverListEntry[]>([]);

  useEffect(() => {
    getDriverList().then(setDriverList);
  }, []);

  return (
    <form>
      <div>
        <label htmlFor="support_status">Support Status:</label>
        <select name="support_status" id="support_status" defaultValue={device.support_status}>

          {Object.values(support_type).map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="driver">Driver:</label>
        <select name="driver" id="driver" defaultValue={String(device.drivers.id)}>
          {driverList.map(driver => (
            <option key={driver.id} value={String(driver.id)}>
              {driver.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="issues">Issues:</label>
        Issues: {device.issues.map(issue =>
          <div key={issue.id}>
            {issue.description}
          </div>)}
      </div>
      <div>
        <label htmlFor="other_device_names">Other Device Names:</label>
        Other Device Names: {device.other_device_names.map(name =>
          <div key={name.id}>
            {name.vendor_name} {name.device_name}
          </div>)}
      </div>
    </form>
  );
}

export default EditDevice;
