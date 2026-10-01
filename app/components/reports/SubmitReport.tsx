'use client'

import { use, useState, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { support_type } from '@/app/generated/prisma/enums'
import { Button, LoadingSpinner } from '@/app/components/Button';
import { reportSubmission } from '@/app/reports/submit/actions';
import { FullDeviceInfo } from '@/lib/local-types';


interface SubmitReportProps {
  userIdPromise: Promise<string | null>;
  devicePromise: Promise<FullDeviceInfo | null>;
}

const SubmitReport = ({ userIdPromise, devicePromise }: SubmitReportProps) => {

  let device = null;
  if (devicePromise) {
    device = use(devicePromise)
  }

  const userId = use(userIdPromise);
  if (userId === null) {
    return <div className="px-4 text-error">Please log in to submit a report.</div>;
  }

  const [submitting, setSubmitting] = useState<boolean>(false);

  interface valueField {
    value: string;
  }

  const [issueFields, setIssueFields] = useState<valueField[]>(device?.issues?.map(issue => ({ value: issue.description })) ?? []);
  const [otherNameVendorFields, setOtherNameVendorFields] = useState<valueField[]>(device?.other_device_names?.map(name => ({ value: name.vendor_name })) ?? []);
  const [otherNameProductFields, setOtherNameProductFields] = useState<valueField[]>(device?.other_device_names?.map(name => ({ value: name.device_name })) ?? []);

  const handleIssueChange = (index: number, event: ChangeEvent<HTMLTextAreaElement>) => {
    const data = [...issueFields];
    data[index].value = event.target.value;
    setIssueFields(data);
  };

  const handleOtherNameVendorChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const data = [...otherNameVendorFields];
    data[index].value = event.target.value;
    setOtherNameVendorFields(data);
  };

   const handleOtherNameProductChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const data = [...otherNameProductFields];
    data[index].value = event.target.value;
    setOtherNameProductFields(data);
  };
 
  const addIssueField = () => {
    setIssueFields([...issueFields, { value: '' }]);
  };

  const addOtherNameField = () => {
    setOtherNameVendorFields([...otherNameVendorFields, { value: '' }]);
    setOtherNameProductFields([...otherNameProductFields, { value: '' }]);
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await reportSubmission(formData);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error + ": " + result.message);
    }
    setSubmitting(false);
  };

  const defaultValues = {
    bus: device?.bus ?? '',
    vendor_id: device?.bus === "USB" ? device?.vendors.usb_id : device?.vendors.pci_id ?? '',
    product_id: device?.product_id ?? '',
    reported_vendor: device?.vendors?.name ?? '',
    reported_product: device?.name ?? '',
    reported_driver: device?.drivers.name ?? '',
    support_status: device?.support_status ?? ''
  };


  return (
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="user_id" value={userId} />

        <div className="grid grid-cols-3 gap-2 max-w-fit">

          <div className="font-bold">Reason:</div>
          <div className="col-span-2">
            <textarea
              name="reason"
              placeholder="brief reason for report"
              className="h-20 w-full"
            />
          </div>

          <div className="font-bold">Bus:</div>
          <div className="col-span-2">
            <select name="bus" defaultValue={defaultValues.bus}>
              <option value="USB">USB</option>
              <option value="PCI">PCI</option>
            </select>
          </div>

          <div className="font-bold">Vendor ID:</div>
          <div className="col-span-2">
            <input type="text" name="vendor_id" defaultValue={defaultValues.vendor_id ?? ""} />
          </div>

          <div className="font-bold">Product ID:</div>
          <div className="col-span-2">
            <input type="text" name="product_id" defaultValue={defaultValues.product_id} />
          </div>

          <div className="font-bold">Vendor Name:</div>
          <div className="col-span-2">
            <input type="text" name="reported_vendor" defaultValue={defaultValues.reported_vendor} />
          </div>

          <div className="font-bold">Product Name:</div>
          <div className="col-span-2">
            <input type="text" name="reported_product" defaultValue={defaultValues.reported_product} />
          </div>

          <div className="font-bold">Driver:</div>
          <div className="col-span-2">
            <input type="text" name="reported_driver" defaultValue={defaultValues.reported_driver} />
          </div>

          <div className="font-bold">Support Status:</div>
          <div className="col-span-2">
            <select name="support_status" defaultValue={defaultValues.support_status}>
              {Object.values(support_type).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-3 mt-4">
            <div className="font-bold">
              Issues:
            </div>
            {issueFields.map((field, index) => (
              <div key={index} className="mt-2 w-full pl-4 flex flex-col gap-2">
                <div>
                  Issue #{index + 1}
                </div>
                <div>
                  <textarea
                    name={`issue${index}`}
                    value={field.value}
                    onChange={(e) => handleIssueChange(index, e)}
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>
          <input type="hidden" name="numIssues" value={issueFields.length} />
          <div className="col-span-3">
            <Button type="button" onClick={addIssueField}>
              Add Issue
            </Button>
          </div>

          <div className="col-span-3 mt-4">
            <div className="font-bold">
              Other Names:
            </div>
            {otherNameVendorFields.map((field, index) => (
              <div key={index} className="mt-2 w-full pl-4 grid grid-cols-3 gap-2">
                <div className="col-span-3">
                  Other Name #{index + 1}:
                </div>
                <div className="col-span-1">
                  Vendor:
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    name={`otherNameVendor${index}`}
                    value={otherNameVendorFields[index].value}
                    onChange={(e) => handleOtherNameVendorChange(index, e)}
                  />
                </div>
                <div className="col-span-1">
                  Product:
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    name={`otherNameProduct${index}`}
                    value={otherNameProductFields[index].value}
                    onChange={(e) => handleOtherNameProductChange(index, e)}
                  />
                </div>
              </div>
            ))}
          </div>
          <input type="hidden" name="numOtherNames" value={otherNameVendorFields.length} />
          <div className="col-span-3">
            <Button type="button" onClick={addOtherNameField}>
              Add Other Name
            </Button>
          </div>

          <div className="col-span-3 mt-4 flex justify-center">
            <Button type="submit" disabled={submitting}>
              {submitting && <LoadingSpinner />}
              Submit Report
            </Button>
          </div>
        </div>
      </form>
  );
};

export default SubmitReport;
  