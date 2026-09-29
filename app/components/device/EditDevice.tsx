'use client'

import { FullDeviceInfo } from "@/lib/local-types";
import { support_type } from "@/app/generated/prisma/enums";
import { getDriverList, updateDevice, type DriverListEntry } from "@/app/device/edit/[id]/actions";
import { ChangeEvent, use, useEffect, useState } from "react";
import { Button, LoadingSpinner } from "@/app/components/Button";
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

  const [loading, setLoading] = useState<boolean>(false);

  const [driverList, setDriverList] = useState<DriverListEntry[]>([]);

  useEffect(() => {
    getDriverList().then(setDriverList);
  }, []);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const result = await updateDevice(formData);
    setLoading(false);
    if (result.success) {
      toast.success(result.message);
      setAddedIssueFields([]);
      setAddedOtherDeviceNameVendorFields([]);
      setAddedOtherDeviceNameProductFields([]);
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

      <div className="font-bold">
        Support Status:
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

      <div className="font-bold">
        Driver:
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

      <div className="font-bold">
        Issues:
      </div>
      <div className="col-span-2">
        <input type="hidden" name="issues_count" value={String(device.issues.length)} />
        {device.issues.map((issue, index) => (
          <div key={index}>
            <input type="hidden" name={`issue_id_${index}`} value={String(issue.id)} />
            <div>
              Issue #{index + 1}
            </div>
            <textarea
              name={`issue_text_${index}`}
              defaultValue={issue.description}
              className="h-20 w-100"
              key={issue.id}
            />
          </div>
        ))}
        <input type="hidden" name="added_issues_count" value={String(addedIssueFields.length)} />
        {addedIssueFields.map((issue, index) => (
          <div key={index} className="mb-2">
            <div>
              Issue #{device.issues.length + index + 1}
            </div>
            <textarea
              name={`added_issue_text_${index}`}
              value={issue.value}
              onChange={(e) => handleAddedIssueChange(index, e)}
              className="h-20 w-100"
            />
          </div>
        ))}
        <Button type="button" onClick={addIssueField}>
          Add Issue
        </Button>
      </div>

      <div className="font-bold">
        Other Device Names:
      </div>
      <input type="hidden" name="other_device_names_count" value={String(device.other_device_names.length)} />
      <div className="col-span-2">
        {device.other_device_names.map((name, index) =>
          <div key={index}>
            <input type="hidden" name={`other_device_name_id_${index}`} value={String(name.id)} />
            <div>
              Other Device Name #{index + 1}
            </div>
            <div>
              Vendor
            </div>
            <div className="col-span-3">
              <input
                type="text"
                name={`other_device_name_vendor_text_${index}`}
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
                name={`other_device_name_product_text_${index}`}
                defaultValue={name.device_name}
                key={`${name.id}-${name.device_name}`}
              />
            </div>
          </div>
        )}
        <input type="hidden" name="added_other_device_name_count" value={String(addedOtherDeviceNameVendorFields.length)} />
        {addedOtherDeviceNameVendorFields.map((name, index) => (
          <div key={index} className="grid grid-cols-4 gap-2 mb-4">
            <div className="col-span-4">
              Other Device Name #{device.other_device_names.length + index + 1}:
            </div>
            <div>
              Vendor
            </div>
            <div className="col-span-3">
              <input
                type="text"
                name={`added_other_device_name_vendor_${index}`}
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
                name={`added_other_device_name_product_${index}`}
                value={addedOtherDeviceNameProductFields[index].value}
                onChange={(e) => handleAddedOtherDeviceNameProductChange(index, e)}
              />
            </div>
          </div>
        ))}
        <div className="mt-2">
          <Button type="button" onClick={addOtherDeviceNameField}>
            Add Other Device Name
          </Button>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading && <LoadingSpinner />}
        Save Device {device.id}
      </Button>
    </form>
  );
}

export default EditDevice;
